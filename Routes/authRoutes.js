 
const express = require('express');
const { register, verifyOTP, resendOTP, login, logout, dashboard } = require('../Controllers/authController');
const { Middleware } = require('../MiddleWare/authmiddleware');




const router = express.Router();

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', login);
router.post('/logout', logout);
router.get('/dashboard', Middleware, dashboard);

module.exports = router;
