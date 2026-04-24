const Auth = require('../models/Auth');
const jwt = require('jsonwebtoken');

const generateToken = (id, role, userId, isFirstLogin) => {
    return jwt.sign({ id, role, userId, isFirstLogin }, process.env.JWT_SECRET || 'supersecretjwtkey_auth', {
        expiresIn: '30d',
    });
};

// @desc    Register a new auth record (Called internally by User Service)
// @route   POST /api/auth/register
// @access  Internal
exports.registerAuth = async (req, res) => {
    try {
        const { email, password, role, isFirstLogin, userId } = req.body;

        const authExists = await Auth.findOne({ email });
        if (authExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const auth = await Auth.create({
            email,
            password,
            role,
            isFirstLogin,
            userId
        });

        res.status(201).json({
            message: 'Auth record created successfully',
            userId: auth.userId
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const auth = await Auth.findOne({ email });

        if (auth && (await auth.matchPassword(password))) {
            res.json({
                _id: auth._id,
                email: auth.email,
                role: auth.role,
                isFirstLogin: auth.isFirstLogin,
                userId: auth.userId,
                token: generateToken(auth._id, auth.role, auth.userId, auth.isFirstLogin),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Reset password (for Doctor first login)
// @route   POST /api/auth/reset-password
// @access  Private
exports.resetPassword = async (req, res) => {
    try {
        const { userId, newPassword } = req.body;
        
        const auth = await Auth.findOne({ userId });
        
        if (!auth) {
            return res.status(404).json({ message: 'User not found' });
        }

        auth.password = newPassword;
        auth.isFirstLogin = false;
        await auth.save();

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Validate token and return user details (Internal)
// @route   GET /api/auth/validate
// @access  Private
exports.validateToken = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey_auth');
        res.json({ valid: true, user: decoded });
    } catch (error) {
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};
