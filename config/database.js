import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Inisialisasi pool dulu sebelum digunakan
const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Fungsi untuk membuat tabel jika belum ada
const createTable = async () => {
  const connection = await pool.getConnection(); // Sekarang pool sudah ada
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
      );
    `);
    console.log("✅ Table 'users' siap digunakan.");
  } catch (error) {
    console.error("❌ Gagal membuat tabel:", error);
  } finally {
    connection.release();
  }
};

// Panggil fungsi setelah pool dibuat
createTable();

export default pool;
