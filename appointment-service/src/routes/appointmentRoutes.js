const express = require('express');
const { setAvailability, getAvailability, bookAppointment, getMyAppointments, updateAppointmentStatus } = require('../controllers/appointmentController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/availability', protect, setAvailability);
router.get('/availability/:doctorId', getAvailability);
router.post('/book', protect, bookAppointment);
router.get('/my-appointments', protect, getMyAppointments);
router.put('/:id/status', protect, updateAppointmentStatus);

module.exports = router;
