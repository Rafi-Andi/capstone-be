import generateToken from "./generateToken.js";
import users from "./users.js";
import bcrypt from "bcryptjs";
import pool from "../config/database.js";
import { nanoid } from "nanoid";
import axios from "axios";
import moment from "moment-timezone";

export const handlerRegister = async (request, h) => {
  try {
    const { username, email, password } = request.payload;

    const [rows] = await pool.query("SELECT * FROM users WHERE email = ? ", [
      email,
    ]);

    if (rows.length > 0) {
      return h
        .response({
          status: "Error",
          pesan: "Email sudah di gunakan",
        })
        .code(409);
    }
    const user_id = `user-${nanoid(10)}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (user_id, username, email, password) VALUES (?, ?, ?, ?)",
      [user_id, username, email, hashedPassword]
    );

    return h
      .response({
        status: "Sukses",
        pesan: "berhasil register",
        user_id: user_id,
        email: email,
        username: username,
      })
      .code(201);
  } catch (err) {
    console.log(err);
    return h
      .response({
        status: "database error",
        pesan: "gagal login",
      })
      .code(500);
  }
};
export const handlerLogin = async (request, h) => {
  try {
    const { email, password } = request.payload;

    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0) {
      return h
        .response({
          status: "Error",
          pesan: "Email atau password tidak ditemukan",
        })
        .code(404);
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return h
        .response({
          status: "Error",
          pesan: "Email atau password salah",
        })
        .code(401);
    }

    const objekToken = {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
    };
    const token = generateToken(objekToken);

    return h.response({ token }).code(200);
  } catch (err) {
    console.error("Login Error:", err);
    return h
      .response({
        status: "Error",
        pesan: "Gagal login",
        detail: err.message,
      })
      .code(500);
  }
};

export const handlerTransactions = async (request, h) => {
  try {
    const { user_id } = request.params;
    const { jumlah, type, deskripsi, tanggal } = request.payload;
    const localMoment = moment.tz(tanggal, "Asia/Jakarta").endOf("day");

    // Konversi ke UTC
    const utcDate = localMoment.utc().format("YYYY-MM-DD HH:mm:ss");

    const [result] = await pool.query(
      "INSERT INTO transactions (user_id, amount, type, description, transaction_date) VALUES (?, ?, ?, ?, ?)",
      [user_id, jumlah, type, deskripsi, utcDate]
    );

    return h
      .response({
        status: "Sukses",
        pesan: "Berhasil menambahkan transaksi",
      })
      .code(201);
  } catch (err) {
    return h
      .response({
        status: "Error",
        pesan: `Gagal menambahkan transaksi: ${err.message}`,
      })
      .code(500);
  }
};

export const handlerTotalTransactions = async (request, h) => {
  try {
    const { user_id } = request.params;

    const [rows] = await pool.query(
      "SELECT * FROM `total_transactions` WHERE user_id = ?",
      [user_id]
    );

    const transactions = rows[0];

    return h
      .response({
        status: "Sukses",
        data: {
          user_id: transactions.user_id,
          total_pemasukan: transactions.total_pemasukan,
          total_pengeluaran: transactions.total_pengeluaran,
          saldo_sekarang: transactions.saldo_sekarang,
        },
      })
      .code(200);
  } catch (err) {
    return h.response({
      status: "Error",
      pesan: "Gagal menampilkan rangkuman transaksi",
      detail: err,
    });
  }
};

export const handlerDetailTransactions = async (request, h) => {
  const { user_id } = request.params;

  try {
    const [rows] = await pool.query(
      `SELECT 
    id,
    user_id,
    CONCAT('Rp ', FORMAT(amount, 0, 'id_ID')) AS amount,
    type,
    description,
    DATE_FORMAT(transaction_date, '%d %M %Y') AS transaction_date
  FROM transactions
  WHERE user_id = ?
  ORDER BY transaction_date DESC;`,
      [user_id]
    );

    const formattedRows = rows.map((row) => ({
      ...row,
      transaction_date: moment(row.transaction_date)
        .tz("Asia/Jakarta")
        .format("YYYY-MM-DD"),
    }));

    return h
      .response({
        status: "Sukses",
        pesan: "Berhasil mendapatkan detail transaksi",
        data: formattedRows,
      })
      .code(200);
  } catch (err) {
    return h
      .response({
        status: "Error",
        pesan: `Gagal mendapatkan detail transaksi: ${err.message}`,
      })
      .code(500);
  }
};

export const handlerChatBot = async (request, h) => {
  const { user_id } = request.params;
  const { text } = request.payload;
  const API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCBcnIBzJH4LtPUWZwL26iYfU1cMwWrTBQ";

  const requestData = {
    contents: [
      {
        parts: [{ text }],
      },
    ],
  };
  try {
    const response = await axios.post(API_URL, requestData, {
      headers: { "Content-Type": "application/json" },
    });
    return h
      .response({
        status: "Sukses",
        pesan: response.data.candidates[0].content.parts[0].text,
      })
      .code(200);
  } catch (err) {
    return h.response({
      status: "Error",
      pesan: "Maaf terjadi masalah servis, mohon tunggu dan kirim kembali",
    });
  }
};
