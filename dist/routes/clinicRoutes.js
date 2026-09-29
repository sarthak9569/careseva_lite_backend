"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Clinic_1 = require("../models/Clinic");
const Doctor_1 = require("../models/Doctor");
const router = (0, express_1.Router)();
// @route   GET /api/clinics
// @desc    Get all approved clinics (with optional city/search query)
router.get('/', async (req, res, next) => {
    try {
        const { city, search, status } = req.query;
        const filter = {};
        if (status) {
            filter.status = status;
        }
        else {
            filter.status = Clinic_1.ClinicStatus.APPROVED;
        }
        if (city) {
            filter.city = { $regex: new RegExp(city, 'i') };
        }
        if (search) {
            filter.$or = [
                { name: { $regex: new RegExp(search, 'i') } },
                { speciality: { $regex: new RegExp(search, 'i') } },
                { city: { $regex: new RegExp(search, 'i') } },
                { clinicId: { $regex: new RegExp(search, 'i') } },
            ];
        }
        const clinics = await Clinic_1.Clinic.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, clinics });
    }
    catch (err) {
        next(err);
    }
});
// @route   GET /api/clinics/:clinicId
// @desc    Get clinic details with doctors
router.get('/:clinicId', async (req, res, next) => {
    try {
        const clinic = await Clinic_1.Clinic.findOne({ clinicId: req.params.clinicId });
        if (!clinic) {
            return res.status(404).json({ success: false, message: 'Clinic not found' });
        }
        const doctors = await Doctor_1.Doctor.find({ clinicId: clinic.clinicId });
        res.json({ success: true, clinic, doctors });
    }
    catch (err) {
        next(err);
    }
});
// @route   POST /api/clinics
// @desc    Create or update clinic (Admin action)
router.post('/', async (req, res, next) => {
    try {
        const clinicData = req.body;
        if (!clinicData.clinicId) {
            clinicData.clinicId = `CS-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        }
        const clinic = await Clinic_1.Clinic.findOneAndUpdate({ clinicId: clinicData.clinicId }, clinicData, { new: true, upsert: true });
        res.json({ success: true, clinic });
    }
    catch (err) {
        next(err);
    }
});
// @route   PATCH /api/clinics/:clinicId/status
// @desc    Update clinic status (Admin action)
router.patch('/:clinicId/status', async (req, res, next) => {
    try {
        const { status } = req.body;
        const clinic = await Clinic_1.Clinic.findOneAndUpdate({ clinicId: req.params.clinicId }, { status }, { new: true });
        if (!clinic) {
            return res.status(404).json({ success: false, message: 'Clinic not found' });
        }
        res.json({ success: true, clinic });
    }
    catch (err) {
        next(err);
    }
});
// @route   GET /api/clinics/:clinicId/doctors
// @desc    Get doctors for a clinic
router.get('/:clinicId/doctors', async (req, res, next) => {
    try {
        const doctors = await Doctor_1.Doctor.find({ clinicId: req.params.clinicId });
        res.json({ success: true, doctors });
    }
    catch (err) {
        next(err);
    }
});
// @route   POST /api/clinics/:clinicId/doctors
// @desc    Add or update doctor for a clinic
router.post('/:clinicId/doctors', async (req, res, next) => {
    try {
        const doctorData = req.body;
        doctorData.clinicId = req.params.clinicId;
        if (!doctorData.doctorId) {
            doctorData.doctorId = `DOC-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        }
        const doctor = await Doctor_1.Doctor.findOneAndUpdate({ doctorId: doctorData.doctorId }, doctorData, { new: true, upsert: true });
        res.json({ success: true, doctor });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
