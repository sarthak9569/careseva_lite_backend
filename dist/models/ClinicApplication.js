"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClinicApplication = void 0;
const mongoose_1 = require("mongoose");
const Clinic_1 = require("./Clinic");
const clinicApplicationSchema = new mongoose_1.Schema({
    id: { type: String, required: true, unique: true, index: true },
    clinicName: { type: String, required: true },
    clinicPhone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    speciality: { type: String, required: true },
    operatingHours: { type: String, required: true },
    doctorName: { type: String, required: true },
    doctorPhone: { type: String, required: true },
    doctorSpeciality: { type: String, required: true },
    doctorQualification: { type: String, required: true },
    doctorRegNum: { type: String, required: true },
    avgConsultationMinutes: { type: Number, default: 10 },
    status: { type: String, enum: Object.values(Clinic_1.ClinicStatus), default: Clinic_1.ClinicStatus.PENDING },
    submittedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date },
    assignedClinicId: { type: String },
    rejectionReason: { type: String },
}, { timestamps: true });
exports.ClinicApplication = (0, mongoose_1.model)('ClinicApplication', clinicApplicationSchema);
