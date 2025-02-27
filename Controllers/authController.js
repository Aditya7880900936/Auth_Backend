

const User = require("../Models/User");

const nodeMailer = require("nodemailer");
const crypto = require("crypto");

const transporter = nodeMailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

const generateOTP = () => crypto.randomInt(100000, 999999).toString();


exports.register = async (req, res) => {
  try {
    const { name , email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    const otp = generateOTP();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000);
    user = new User({ name, email, password, otp , otpExpire});
    await user.save();
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "OTP Verification",
      text:``,
      html:  `
            <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; text-align: center; padding: 20px;">
                <div style="max-width: 500px; background: #ffffff; padding: 20px; border-radius: 8px; margin: auto; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                    <h2 style="color: #333;">You're Invited! 🎉</h2>
                    <p>Hello Your OTP is,</p>
                    <p>${otp}</p>
                    <p style="margin-top: 20px; font-size: 14px; color: #777;">© 2025 Aditya. All rights reserved.</p>
                </div>
            </div>`
    };
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "User Registered. Please Verify OTP sent to your email" });
  } catch (error) {
    res.status(500).json({ message: "Error Registering User", error });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    if(user.isVerified){
        return res.status(400).json({ message: "User already verified" });
    }
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    if (user.otpExpire < Date.now()) {
      return res.status(400).json({ message: "OTP has expired" });
    }
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();
    res.status(200).json({ message: "Email Verified Successfully. Now You can Login" });
  } catch (error) {
    res.status(500).json({ message: "Error Verifying User", error });
  }
};


exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    if(user.isVerified){
        return res.status(400).json({ message: "User already verified" });
    }
    const otp = generateOTP();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000);
    user.otp = otp;
    user.otpExpire = otpExpire;
    await user.save();
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "OTP Verification",
      text: `Your OTP is ${otp}`,
      html:  `
            <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; text-align: center; padding: 20px;">
                <div style="max-width: 500px; background: #ffffff; padding: 20px; border-radius: 8px; margin: auto; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                    <h2 style="color: #333;">You're Invited! 🎉</h2>
                    <p>Hello Your OTP is,</p>
                    <p>${otp}</p>
                    <p style="margin-top: 20px; font-size: 14px; color: #777;">© 2025 Aditya. All rights reserved.</p>
                </div>
            </div>`
    };
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "OTP resent to your email" });
  } catch (error) {
    res.status(500).json({ message: "Error Resending OTP", error });
  }
};

exports.login = async (req, res) => {   
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    if (!user.isVerified) {
      return res.status(400).json({ message: "User not verified.Please Verify OTP" });
    }
    if (user.password !== password) {
      return res.status(400).json({ message: "Incorrect Password" });
    }

    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
    };
    res.status(200).json({ message: "User Logged In Successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error Logging In User", error });
  }
};

exports.logout = async (req, res) => {
  try {
    req.session.destroy();
    res.status(200).json({ message: "User Logged Out Successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error Logging Out User", error });
  }
}

exports.dashboard = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) {
      return res.status(400).json({ message: "User not logged in" });
    }
    res.status(200).json({ message: "User Dashboard", user });
  } catch (error) {
    res.status(500).json({ message: "Error Fetching Dashboard", error });
  }
};