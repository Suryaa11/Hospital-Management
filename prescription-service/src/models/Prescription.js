const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    timing: {
        morning: { type: Boolean, default: false },
        noon: { type: Boolean, default: false },
        night: { type: Boolean, default: false }
    },
    instruction: {
        type: String,
        enum: ['Before Food', 'After Food', 'With Food', 'None'],
        default: 'After Food'
    },
    durationDays: {
        type: Number,
        required: true
    }
});

const prescriptionSchema = new mongoose.Schema({
    appointmentId: {
        type: String, // References Appointment _id
        required: true
    },
    doctorId: {
        type: String,
        required: true
    },
    patientId: {
        type: String,
        required: true
    },
    medicines: [medicineSchema],
    nextVisitDate: {
        type: Date
    },
    notes: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);
