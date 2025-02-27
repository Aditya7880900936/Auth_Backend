const mongoose = require("mongoose");

const User = require("../Models/User");

const dotenv = require("dotenv");
dotenv.config();
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB Successfully");
    await User.createCollection();
    console.log("User Collection is created successfully");
  } catch (error) {
    console.log("MongoDB Connection Failed",error.message);
    process.exit(1);
  }
};
module.exports = {connectDB};
