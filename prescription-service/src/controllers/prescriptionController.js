const Prescription = require('../models/Prescription');

// Helper to update appointment status via HTTP
const updateAppointmentStatus = async (appointmentId, status, token) => {
    const appointmentUrl = process.env.APPOINTMENT_SERVICE_URL || 'http://localhost:5003';
    const response = await fetch(`${appointmentUrl}/${appointmentId}/status`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
    });
    
    if (!response.ok) {
        console.error('Failed to update appointment status');
    }
};

// @desc    Doctor creates a prescription
// @route   POST /api/prescriptions
// @access  Private (Doctor)
exports.createPrescription = async (req, res) => {
    try {
        if (req.user.role !== 'Doctor') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { appointmentId, patientId, medicines, nextVisitDate, notes } = req.body;

        const prescription = await Prescription.create({
            appointmentId,
            doctorId: req.user.userId,
            patientId,
            medicines,
            nextVisitDate,
            notes
        });

        // Mark appointment as Completed
        const token = req.headers.authorization.split(' ')[1];
        await updateAppointmentStatus(appointmentId, 'Completed', token);

        res.status(201).json({ message: 'Prescription created successfully', prescription });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get prescriptions for a patient or doctor
// @route   GET /api/prescriptions
// @access  Private
exports.getPrescriptions = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'Patient') {
            query.patientId = req.user.userId;
        } else if (req.user.role === 'Doctor') {
            query.doctorId = req.user.userId;
        }

        const prescriptions = await Prescription.find(query).sort({ createdAt: -1 });
        res.json(prescriptions);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get a specific prescription by ID
// @route   GET /api/prescriptions/:id
// @access  Private
exports.getPrescriptionById = async (req, res) => {
    try {
        const prescription = await Prescription.findById(req.params.id);
        
        if (!prescription) {
            return res.status(404).json({ message: 'Prescription not found' });
        }

        // Authorization check
        if (req.user.role === 'Patient' && prescription.patientId !== req.user.userId) {
             return res.status(403).json({ message: 'Not authorized' });
        }
        if (req.user.role === 'Doctor' && prescription.doctorId !== req.user.userId) {
             return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(prescription);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
