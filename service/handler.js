import generateToken from "./generateToken.js"
import users from "./users.js"
import bcrypt from "bcryptjs"
import pool from "../config/database.js"

export const handlerRegister = async (request, h) => {
    // const hashedPassword = await bcrypt.hash(password, 10)
    // const newUser = {
        //     id: users.length + 1,
        //     username,
        //     password: hashedPassword
        // }
        
        // users.push(newUser)
        
    
    try {
        const {username, password} = request.payload

        const hashedPassword = await bcrypt.hash(password, 10)
        const [result] = await pool.query("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword])
        return h.response({
            pesan: "berhasil register",
            id: result.insertId,
            username: username
        }).code(201)
    } catch(err){
        console.log(err)
        return h.response({
            error: "database error",
            pesan: "gagal login"
        }).code(500)
    }
}
export const handlerLogin = async (request, h) => {
    try {
        const { username, password } = request.payload;

        // Query user berdasarkan username
        const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);

        // Perbaikan pengecekan jika user tidak ditemukan
        if (rows.length === 0) {
            return h.response({ error: "Username atau password tidak ditemukan" }).code(404);
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        // Jika password salah
        if (!isMatch) {
            return h.response({ error: "Username atau password salah" }).code(401);
        }

        // Jika password benar, buat token
        const objekToken = {
            id: user.id,
            username: user.username
        };
        const token = generateToken(objekToken);

        return h.response({ token }).code(200);
    } catch (err) {
        console.error("Login Error:", err);
        return h.response({ error: "Gagal login", detail: err.message }).code(500);
    }
};
