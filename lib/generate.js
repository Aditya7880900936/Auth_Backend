const jwt = require("jsonwebtoken");

const generateToken = (userId, res) => {
    if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is missing in environment variables!");
        return null;
    }

    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });

    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict"
    });

    return token;
};

module.exports = generateToken;
