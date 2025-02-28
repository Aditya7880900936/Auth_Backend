const express = require('express');
const dotenv = require('dotenv');
const {connectDB} = require('./Config/db');
const session = require('express-session')
dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
}))

const authRoutes = require('./Routes/authRoutes');
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on Port ${PORT}`);
});