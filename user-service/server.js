const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/db');
const userRoutes = require('./src/routes/userRoutes');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use('/', userRoutes); // User service routes

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
    console.log(`User Service running on port ${PORT}`);
});
