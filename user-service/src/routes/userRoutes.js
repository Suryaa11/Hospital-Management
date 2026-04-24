const express = require('express');
const { createDoctor, registerPatient, getDoctors, updateDoctorProfile, getUserProfile } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/doctor', protect, createDoctor); // Admin only, protected
router.post('/patient', registerPatient); // Public registration
router.get('/doctors', getDoctors); // Public or protected, depending on need. Making it public for browsing.
router.put('/doctor/profile', protect, updateDoctorProfile); // Doctor only
router.get('/profile/:userId', protect, getUserProfile); // Protected

module.exports = router;
