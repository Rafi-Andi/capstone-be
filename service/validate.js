import users from "./users.js"
import pool from "../config/database.js"

const validate = async (decoded, request, h) => {

    try {
        const [rows] = await pool.query("SELECT * FROM users WHERE user_id = ?", [decoded.id])
        
        if(rows.length === 0) {
            return {
                isValid: false
            }
        }

        const user = rows[0]

        return {
            isValid: true,
            credentials: {
                id: user.user_id,
                username: user.username
            }
        } 
    } catch(err) {
        console.error(err);
        return { isValid: false };
    }
}

export default validate