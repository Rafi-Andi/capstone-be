import generateToken from "./generateToken.js"
import users from "./users.js"
import bcrypt from "bcryptjs"
import pool from "../config/database.js"
import { nanoid } from "nanoid"

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

        const [rows] = await pool.query("SELECT * FROM users WHERE email = ? ", [email])

        if(rows.length > 0) {
            return h.response({
                status: "Error",
                pesan: "Email sudah di gunakan",
            }).code(409)
        }
        const user_id = `user-${nanoid(10)}`
        const hashedPassword = await bcrypt.hash(password, 10)
        const [result] = await pool.query("INSERT INTO users (user_id, username, email, password) VALUES (?, ?, ?, ?)", [user_id, username, email, hashedPassword])
        
        return h.response({
            status: "Sukses",
            pesan: "berhasil register",
            user_id: user_id,
            email: email,
            username: username
        }).code(201)
    } catch(err){
        console.log(err)
        return h.response({
            status: "database error",
            pesan: "gagal login"
        }).code(500)
    }
}
export const handlerLogin = async (request, h) => {
    try {
        const { email, password } = request.payload;

        const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

        if (rows.length === 0) {
            return h.response({ 
                status: "Error",
                pesan: "Email atau password tidak ditemukan" 
            }).code(404);
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return h.response({ 
                status: "Error",
                pesan : "Email atau password salah" 
            }).code(401);
        }

        const objekToken = {
            user_id: user.user_id,
            username: user.username,
            email: user.email
        };
        const token = generateToken(objekToken);

        return h.response({ token }).code(200);
    } catch (err) {
        console.error("Login Error:", err);
        return h.response({
            status: "Error",
            pesan : "Gagal login", 
            detail: err.message 
        }).code(500);
    }
};

export const handlerTransactions = () => {

}