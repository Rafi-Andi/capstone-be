import jwt from "jsonwebtoken";

const generateToken = (user) => {
    return jwt.sign({
        id: user.id,
        username: user.username,
        email: user.email
    }, process.env.JWT_SECRET, {
        expiresIn: "24h"
    })
}

export default generateToken