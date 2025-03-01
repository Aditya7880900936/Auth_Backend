const express = require('express');
const { register, verifyOTP, resendOTP, login, logout, dashboard } = require('../Controllers/authController');
const User = require('../Models/User');
const { getFakeData, saveCategory } = require('../Controllers/fakerController');
const jwt = require('jsonwebtoken');

const router = express.Router();

const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No Token Provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({ message: "Unauthorized - Invalid Token" });
        }

        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User Not Found" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("JWT Verification Error:", error);
        return res.status(401).json({ message: "Unauthorized - Invalid or Expired Token" });
    }
};

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', login);
router.post('/logout', logout);
router.get('/dashboard', protectRoute, dashboard);
router.get('/faker-data', getFakeData);
router.post('/save-category', saveCategory);


module.exports = router;
