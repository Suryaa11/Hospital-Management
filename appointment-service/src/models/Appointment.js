const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patientId: {
        type: String, // References Auth _id of patient
        required: true
    },
    doctorId: {
        type: String, // References Auth _id of doctor
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: String, // e.g. "10:00 AM"
        required: true
    },
    endTime: {
        type: String, // e.g. "10:30 AM"
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected', 'Completed'],
        default: 'Pending'
    },
    preVisitNote: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
