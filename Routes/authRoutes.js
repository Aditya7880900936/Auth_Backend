const express = require('express');
const { register, verifyOTP, resendOTP, login, logout, dashboard } = require('../Controllers/authController');
const User = require('../Models/User');
const jwt = require('jsonwebtoken');
const router = express.Router();
const protectRoute = async(req,res,next)=>{
    try {
        const token = req.cookies.jwt
        if(!token){
            return res.status(401).json({message:"Unauthorized-No token Provided"})
        }
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        if(!decoded){
            return res.status(401).json({message:"Unauthorized-No token Provided"});
        }
        const user = await User.findById(decoded.userId).select("-password");
        if(!user){
            return res.status(404).json({message:"User Not Found"});
        }
        req.user = user;
        next();

    } catch (error) {
        console.log(error);
        
    }
}
router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', login);
router.post('/logout', logout);
router.get('/dashboard', protectRoute, dashboard);

module.exports = router;

