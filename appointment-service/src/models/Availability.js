const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
    doctorId: {
        type: String, // References Auth _id
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: String, // format HH:MM
        required: true
    },
    endTime: {
        type: String, // format HH:MM
        required: true
    },
    isBooked: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Availability', availabilitySchema);
