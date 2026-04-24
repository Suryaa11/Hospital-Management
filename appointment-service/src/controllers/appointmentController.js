const Appointment = require('../models/Appointment');
const Availability = require('../models/Availability');
const mongoose = require('mongoose');

// @desc    Doctor sets availability
// @route   POST /api/appointments/availability
// @access  Private (Doctor)
exports.setAvailability = async (req, res) => {
    try {
        if (req.user.role !== 'Doctor') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { date, startTime, endTime } = req.body;
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0,0,0,0);

        if (selectedDate < today) {
            return res.status(400).json({ message: 'Cannot set availability for past dates' });
        }

        // Validate startTime < endTime (simple string comparison works for HH:MM 24h format)
        if (startTime >= endTime) {
            return res.status(400).json({ message: 'Start time must be before end time' });
        }

        const availability = await Availability.create({
            doctorId: req.user.userId,
            date: selectedDate,
            startTime,
            endTime
        });

        res.status(201).json(availability);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get doctor's availability
// @route   GET /api/appointments/availability/:doctorId
// @access  Public
exports.getAvailability = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const today = new Date();
        today.setHours(0,0,0,0);

        const availabilities = await Availability.find({ 
            doctorId, 
            date: { $gte: today },
            isBooked: false
        }).sort({ date: 1, startTime: 1 });

        res.json(availabilities);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Patient books an appointment
// @route   POST /api/appointments/book
// @access  Private (Patient)
exports.bookAppointment = async (req, res) => {
    try {
        if (req.user.role !== 'Patient') {
            return res.status(403).json({ message: 'Only patients can book appointments' });
        }

        const { availabilityId } = req.body;
        
        const availability = await Availability.findById(availabilityId);
        if (!availability || availability.isBooked) {
            return res.status(400).json({ message: 'Slot not available' });
        }

        const appointment = await Appointment.create({
            patientId: req.user.userId,
            doctorId: availability.doctorId,
            date: availability.date,
            startTime: availability.startTime,
            endTime: availability.endTime
        });

        // Mark as booked
        availability.isBooked = true;
        await availability.save();

        res.status(201).json({ message: 'Appointment booked successfully', appointment });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get appointments for user (Doctor or Patient)
// @route   GET /api/appointments/my-appointments
// @access  Private
exports.getMyAppointments = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'Doctor') {
            query.doctorId = req.user.userId;
        } else if (req.user.role === 'Patient') {
            query.patientId = req.user.userId;
        } else {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const appointments = await Appointment.find(query).sort({ date: 1, startTime: 1 });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Doctor updates appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private (Doctor)
exports.updateAppointmentStatus = async (req, res) => {
    try {
        if (req.user.role !== 'Doctor') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { status, preVisitNote } = req.body;
        
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        if (appointment.doctorId !== req.user.userId) {
            return res.status(403).json({ message: 'Not your appointment' });
        }

        if (status) appointment.status = status;
        if (preVisitNote !== undefined) appointment.preVisitNote = preVisitNote;

        await appointment.save();

        // If rejected, free up the slot
        if (status === 'Rejected') {
            await Availability.findOneAndUpdate(
                { doctorId: appointment.doctorId, date: appointment.date, startTime: appointment.startTime },
                { isBooked: false }
            );
        }

        res.json({ message: 'Appointment updated', appointment });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
