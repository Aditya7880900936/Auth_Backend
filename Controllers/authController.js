const User = require("../Models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodeMailer = require("nodemailer");
const crypto = require("crypto");

const transporter = nodeMailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

const generateOTP = () => crypto.randomInt(10000000, 99999999).toString();

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const otp = generateOTP();
    const otpExpire = Date.now() + 10 * 60 * 1000;

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ name, email, password: hashedPassword, otp, otpExpire });

    await user.save();
    console.log("User saved successfully");

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "OTP Verification",
      html: `<p>Your OTP is <strong>${otp}</strong>. It expires in 10 minutes.</p>`,
    };

    const emailResult = await transporter.sendMail(mailOptions);
    console.log("Email sent:", emailResult);

    res.status(200).json({ message: "User Registered. Please verify OTP sent to your email." });
  } catch (error) {
    console.error("Error Registering User:", error);
    res.status(500).json({ message: "Error Registering User", error });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.isVerified) return res.status(400).json({ message: "User already verified" });

    if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    if (user.otpExpire < Date.now()) return res.status(400).json({ message: "OTP expired" });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    res.status(200).json({ message: "Email Verified. You can now login." });
  } catch (error) {
    res.status(500).json({ message: "Error Verifying User", error });
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.isVerified) return res.status(400).json({ message: "User already verified" });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "OTP Verification",
      html: `<p>Your OTP is <strong>${otp}</strong>. It expires in 10 minutes.</p>`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "OTP resent to your email." });
  } catch (error) {
    res.status(500).json({ message: "Error Resending OTP", error });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "User not found" });

    if (!user.isVerified) return res.status(400).json({ message: "Please verify OTP before logging in." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect Password" });

    const token = generateToken(user._id);

    res.cookie("jwt", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });

    res.status(200).json({
      success: true,
      message: "User Logged In Successfully",
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Error Logging In User", error });
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie("jwt");
    res.status(200).json({ message: "User Logged Out Successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error Logging Out User", error });
  }
};

exports.dashboard = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(400).json({ message: "User not logged in" });

    res.status(200).json({ message: "User Dashboard", user });
  } catch (error) {
    res.status(500).json({ message: "Error Fetching Dashboard", error });
  }
};
