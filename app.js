const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors')
const {connectDB} = require('./Config/db');
const cookie = require('cookie-parser');
dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use(cookie());

app.use(cors({
   origin:"https://e-commerce-revispy.vercel.app",
   credentials:true,
   methods: ['GET', 'POST'],
   allowedHeaders: ['Content-Type', 'Authorization']
}))


const authRoutes = require('./Routes/authRoutes');
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on Port ${PORT}`);
});