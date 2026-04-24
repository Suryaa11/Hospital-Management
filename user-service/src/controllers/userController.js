const User = require('../models/User');
const { sendInviteEmail } = require('../services/emailService');
const mongoose = require('mongoose');

// Helper to communicate with Auth Service
const createAuthRecord = async (email, password, role, isFirstLogin, userId) => {
    const authUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
    const response = await fetch(`${authUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role, isFirstLogin, userId })
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create auth record');
    }
    return await response.json();
};

// @desc    Admin creates a Doctor
// @route   POST /api/users/doctor
// @access  Private (Admin only)
exports.createDoctor = async (req, res) => {
    try {
        // Ensure user is Admin
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Not authorized as admin' });
        }

        const { name, email, phone, specialization, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const userId = new mongoose.Types.ObjectId().toString();

        // 1. Create Auth Record
        await createAuthRecord(email, password, 'Doctor', true, userId);

        // 2. Create User Profile
        const user = await User.create({
            userId,
            name,
            email,
            phone,
            role: 'Doctor',
            specialization,
            experience: 0
        });

        // 3. Send Email
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const loginLink = `${frontendUrl}/login`;
        await sendInviteEmail(name, email, password, loginLink);

        res.status(201).json({
            message: 'Doctor created successfully and invite sent',
            user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

// @desc    Register a Patient
// @route   POST /api/users/patient
// @access  Public
exports.registerPatient = async (req, res) => {
    try {
        const { name, email, password, phone, age, gender } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const userId = new mongoose.Types.ObjectId().toString();

        // 1. Create Auth Record (Patient doesn't need to reset password on first login)
        await createAuthRecord(email, password, 'Patient', false, userId);

        // 2. Create User Profile
        const user = await User.create({
            userId,
            name,
            email,
            phone,
            role: 'Patient',
            age,
            gender
        });

        res.status(201).json({
            message: 'Patient registered successfully',
            user
        });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

// @desc    Get all doctors
// @route   GET /api/users/doctors
// @access  Public
exports.getDoctors = async (req, res) => {
    try {
        // Patients can filter by specialization
        const query = { role: 'Doctor' };
        if (req.query.specialization) {
            query.specialization = req.query.specialization;
        }

        const doctors = await User.find(query).select('-__v');
        res.json(doctors);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update Doctor Profile (Experience)
// @route   PUT /api/users/doctor/profile
// @access  Private (Doctor only)
exports.updateDoctorProfile = async (req, res) => {
    try {
        if (req.user.role !== 'Doctor') {
            return res.status(403).json({ message: 'Not authorized as doctor' });
        }

        const { experience } = req.body;
        
        const user = await User.findOneAndUpdate(
            { userId: req.user.userId },
            { experience },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'Profile updated', user });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get User Profile
// @route   GET /api/users/profile/:userId
// @access  Private
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.params.userId }).select('-__v');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
