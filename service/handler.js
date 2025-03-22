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
        const {username, email, password} = request.payload

        const hashedPassword = await bcrypt.hash(password, 10)
        const [result] = await pool.query("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", [username, email, hashedPassword])
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
        const { email, password } = request.payload;

        const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

        if (rows.length === 0) {
            return h.response({ error: "email atau password tidak ditemukan" }).code(404);
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return h.response({ error: "email atau password salah" }).code(401);
        }

        const objekToken = {
            id: user.id,
            email: user.email
        };
        const token = generateToken(objekToken);

        return h.response({ token }).code(200);
    } catch (err) {
        console.error("Login Error:", err);
        return h.response({ error: "Gagal login", detail: err.message }).code(500);
    }
};
