const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(morgan('dev'));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

app.use(limiter);

// Auth Middleware to protect routes (Basic check if needed at gateway level, or let microservices handle it)
// We will let microservices handle deep authorization, but Gateway can do basic token forwarding.

// Routes Configuration
const services = {
    '/api/auth': process.env.AUTH_SERVICE_URL || 'http://localhost:5001',
    '/api/users': process.env.USER_SERVICE_URL || 'http://localhost:5002',
    '/api/appointments': process.env.APPOINTMENT_SERVICE_URL || 'http://localhost:5003',
    '/api/prescriptions': process.env.PRESCRIPTION_SERVICE_URL || 'http://localhost:5004'
};

// Set up proxy middleware for each service
for (const [path, target] of Object.entries(services)) {
    app.use(path, createProxyMiddleware({
        target,
        changeOrigin: true,
        pathRewrite: {
            [`^${path}`]: '', // strip the /api/... prefix when forwarding to microservice
        },
        onError: (err, req, res) => {
            console.error(`Error with proxy for ${path}:`, err.message);
            res.status(500).json({ error: 'Proxy Error', details: err.message });
        }
    }));
}

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'API Gateway is running' });
});

app.listen(PORT, () => {
    console.log(`API Gateway is running on port ${PORT}`);
});
