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
        user_id VARCHAR(21) NOT NULL UNIQUE,  -- Nanoid sebagai user ID
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(200) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
      );
    `);
    console.log("✅ Table 'users' siap digunakan.");

    await connection.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        type ENUM('income', 'expense') NOT NULL,
        description TEXT,
        transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log("✅ Table 'transactions' siap digunakan.");
  } catch (error) {
    console.error("❌ Gagal membuat tabel:", error);
  } finally {
    connection.release();
  }
};

createTables();

export default pool;
