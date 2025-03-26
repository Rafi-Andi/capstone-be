import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

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

const createTables = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(21) NOT NULL UNIQUE,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(200) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
      );
    `);
    console.log("Table 'users' siap digunakan.");

    await connection.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(21) NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        type ENUM('pemasukan', 'pengeluaran') NOT NULL,
        description TEXT,
        transaction_date DATETIME NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      );
    `);
    console.log("Table 'transactions' siap digunakan.");

    await connection.query(`
      CREATE OR REPLACE VIEW total_transactions AS
      SELECT 
          user_id,
          CONCAT('Rp ', FORMAT(COALESCE(SUM(CASE WHEN type = 'pemasukan' THEN amount END), 0), 0, 'id_ID')) AS total_pemasukan,
          CONCAT('Rp ', FORMAT(COALESCE(SUM(CASE WHEN type = 'pengeluaran' THEN amount END), 0), 0, 'id_ID')) AS total_pengeluaran,
          CONCAT('Rp ', FORMAT(
            COALESCE(SUM(CASE WHEN type = 'pemasukan' THEN amount END), 0) - 
            COALESCE(SUM(CASE WHEN type = 'pengeluaran' THEN amount END), 0), 0, 'id_ID'
          )) AS saldo_sekarang
      FROM transactions
      GROUP BY user_id;
    `);
    console.log("View 'total_transactions' siap digunakan dengan format Rupiah.");
  } catch (error) {
    console.error("Gagal membuat tabel atau view:", error);
  } finally {
    connection.release();
  }
};

createTables();

export default pool;
