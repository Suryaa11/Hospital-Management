const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/db');
const appointmentRoutes = require('./src/routes/appointmentRoutes');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use('/', appointmentRoutes);

const PORT = process.env.PORT || 5003;

app.listen(PORT, () => {
    console.log(`Appointment Service running on port ${PORT}`);
});
