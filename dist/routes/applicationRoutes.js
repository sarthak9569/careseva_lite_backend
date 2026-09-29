"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ClinicApplication_1 = require("../models/ClinicApplication");
const Clinic_1 = require("../models/Clinic");
const Doctor_1 = require("../models/Doctor");
const router = (0, express_1.Router)();
// @route   POST /api/applications
// @desc    Submit new clinic registration application (from clinical module)
router.post('/', async (req, res, next) => {
    try {
        const appData = req.body;
        if (!appData.id) {
            appData.id = `APP-${Math.floor(100000 + Math.random() * 900000)}`;
        }
        appData.submittedAt = appData.submittedAt || new Date();
        appData.status = appData.status || Clinic_1.ClinicStatus.PENDING;
        const application = await ClinicApplication_1.ClinicApplication.create(appData);
        res.status(201).json({ success: true, application });
    }
    catch (err) {
        next(err);
    }
});
// @route   GET /api/applications
// @desc    Get all applications (Admin dashboard)
router.get('/', async (req, res, next) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status) {
            filter.status = status;
        }
        const applications = await ClinicApplication_1.ClinicApplication.find(filter).sort({ submittedAt: -1 });
        res.json({ success: true, applications });
    }
    catch (err) {
        next(err);
    }
});
// @route   GET /api/applications/:id
// @desc    Get application by ID
router.get('/:id', async (req, res, next) => {
    try {
        const application = await ClinicApplication_1.ClinicApplication.findOne({ id: req.params.id });
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }
        res.json({ success: true, application });
    }
    catch (err) {
        next(err);
    }
});
// @route   POST /api/applications/:id/approve
// @desc    Approve application: Creates Clinic & Doctor records automatically
router.post('/:id/approve', async (req, res, next) => {
    try {
        const application = await ClinicApplication_1.ClinicApplication.findOne({ id: req.params.id });
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }
        const generatedClinicId = `CS-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        const generatedDoctorId = `DOC-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        // Create Clinic
        const clinic = await Clinic_1.Clinic.create({
            clinicId: generatedClinicId,
            name: application.clinicName,
            phone: application.clinicPhone,
            email: application.email,
            address: application.address,
            city: application.city,
            state: application.state,
            pincode: application.pincode,
            latitude: application.latitude,
            longitude: application.longitude,
            speciality: application.speciality,
            operatingHours: application.operatingHours,
            status: Clinic_1.ClinicStatus.APPROVED,
        });
        // Create Doctor
        const doctor = await Doctor_1.Doctor.create({
            doctorId: generatedDoctorId,
            clinicId: generatedClinicId,
            name: application.doctorName,
            phone: application.doctorPhone,
            speciality: application.doctorSpeciality,
            qualification: application.doctorQualification,
            avgConsultationMinutes: application.avgConsultationMinutes || 10,
        });
        // Update Application
        application.status = Clinic_1.ClinicStatus.APPROVED;
        application.reviewedAt = new Date();
        application.assignedClinicId = generatedClinicId;
        await application.save();
        res.json({ success: true, application, clinic, doctor });
    }
    catch (err) {
        next(err);
    }
});
// @route   POST /api/applications/:id/reject
// @desc    Reject application with reason
router.post('/:id/reject', async (req, res, next) => {
    try {
        const { rejectionReason } = req.body;
        const application = await ClinicApplication_1.ClinicApplication.findOne({ id: req.params.id });
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }
        application.status = Clinic_1.ClinicStatus.REJECTED;
        application.reviewedAt = new Date();
        application.rejectionReason = rejectionReason || 'Information verification failed';
        await application.save();
        res.json({ success: true, application });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
