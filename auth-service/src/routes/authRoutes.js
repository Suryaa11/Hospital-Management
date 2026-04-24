const express = require('express');
const { registerAuth, login, resetPassword, validateToken } = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerAuth);
router.post('/login', login);
router.post('/reset-password', resetPassword);
router.get('/validate', validateToken);

module.exports = router;
