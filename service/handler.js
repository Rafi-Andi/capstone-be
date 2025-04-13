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

    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [
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
    const result = await pool.query(
      "INSERT INTO users (user_id, username, email, password) VALUES ($1, $2, $3, $4) RETURNING *",
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

    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [
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

export const handlerAddTransactions = async (request, h) => {
  try {
    const { id } = request.auth.credentials;
    const { jumlah, type, deskripsi, tanggal } = request.payload;
    const localMoment = moment.tz(tanggal, "Asia/Jakarta").endOf("day");

    const utcDate = localMoment.utc().format("YYYY-MM-DD HH:mm:ss");

    const result = await pool.query(
      "INSERT INTO transactions (user_id, amount, type, description, transaction_date) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [id, jumlah, type, deskripsi, utcDate]
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

export const handlerSummaryTransactions = async (request, h) => {
  try {
    const { id } = request.auth.credentials;

    const { rows } = await pool.query(
      "SELECT * FROM total_transactions WHERE user_id = $1",
      [id]
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
  const { id } = request.auth.credentials;

  try {
    const { rows } = await pool.query(
      `SELECT 
        id,
        user_id,
        'Rp ' || TO_CHAR(amount, 'FM999,999,999,999') AS amount,
        type,
        description,
        transaction_date
      FROM transactions
      WHERE user_id = $1
      ORDER BY transaction_date DESC;`,
      [id]
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

export const handlerPredict = async (request, h) => {
  const { id } = request.auth.credentials;
  const { tanggal_prediksi } = request.payload;

  try {
    const { rows: transactionTypes } = await pool.query(
      "SELECT type, COUNT(*) FROM transactions WHERE user_id = $1 GROUP BY type",
      [id]
    );

    const hasIncome = transactionTypes.some(row => row.type === 'pemasukan');
    const hasExpense = transactionTypes.some(row => row.type === 'pengeluaran');

    if (!hasIncome || !hasExpense) {
      return h.response({
        status: 'Error',
        message: 'Prediksi membutuhkan data pemasukan dan pengeluaran. Mohon tambahkan kedua jenis transaksi.'
      }).code(400);
    }

    const { rows: uniqueDates } = await pool.query(
      "SELECT COUNT(DISTINCT DATE(transaction_date)) as unique_date_count FROM transactions WHERE user_id = $1",
      [id]
    );

    if (uniqueDates[0].unique_date_count < 2) {
      return h.response({
        status: 'Error',
        message: 'Prediksi membutuhkan transaksi dengan minimal dua tanggal berbeda.'
      }).code(400);
    }

    const payload = {
      user_id: id,
      tanggal_prediksi: tanggal_prediksi
    };

    const response = await axios.post(
      'https://bimaardhia-lstm.hf.space/predict',
      payload
    );

    if (!response.data || !response.data.tanggal) {
      return h.response({
        status: 'Error',
        message: 'Respons dari server AI tidak valid.'
      }).code(502);
    }

    const predictionData = response.data;
    const predictionId = `pred-${nanoid(10)}`;

    await pool.query(
      `INSERT INTO predictions 
       (prediction_id, user_id, prediction_date, predicted_balance, lower_bound, upper_bound, raw_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        predictionId,
        id,
        predictionData.tanggal,
        predictionData.prediksi_saldo,
        predictionData.batas_bawah,
        predictionData.batas_atas,
        JSON.stringify(predictionData)
      ]
    );

    const formattedData = {
      tanggal: predictionData.tanggal,
      prediksi_saldo: `Rp ${predictionData.prediksi_saldo.toLocaleString('id-ID')}`,
      batas_bawah: `Rp ${predictionData.batas_bawah.toLocaleString('id-ID')}`,
      batas_atas: `Rp ${predictionData.batas_atas.toLocaleString('id-ID')}`
    };

    return h.response({
      status: 'success',
      data: {
        prediction_id: predictionId,
        ...formattedData
      }
    }).code(200);

  } catch (err) {
    return h.response({
      status: 'Error',
      message: err.response?.data || err.message
    }).code(err.response?.status || 500);
  }
};
