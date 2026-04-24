const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: { // References Auth _id
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    phone: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['Admin', 'Doctor', 'Patient'],
        required: true
    },
    // Doctor specific fields
    specialization: {
        type: String,
        enum: [
            'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology', 
            'Neurology', 'Orthopedics', 'Pediatrics', 'Psychiatry', 
            'Radiology', 'Surgery', 'Urology', 'Ophthalmology', 'Gynecology', 'Oncology', 'General Medicine'
        ]
    },
    experience: {
        type: Number // in years
    },
    // Patient specific fields
    age: Number,
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other']
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
