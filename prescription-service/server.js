const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/db');
const prescriptionRoutes = require('./src/routes/prescriptionRoutes');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use('/', prescriptionRoutes);

const PORT = process.env.PORT || 5004;

app.listen(PORT, () => {
    console.log(`Prescription Service running on port ${PORT}`);
});
