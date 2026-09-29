"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Doctor = void 0;
const mongoose_1 = require("mongoose");
const doctorSchema = new mongoose_1.Schema({
    doctorId: { type: String, required: true, unique: true, index: true },
    clinicId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    speciality: { type: String, required: true },
    qualification: { type: String, required: true },
    avgConsultationMinutes: { type: Number, default: 10 },
}, { timestamps: true });
exports.Doctor = (0, mongoose_1.model)('Doctor', doctorSchema);
