"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Clinic = exports.ClinicStatus = void 0;
const mongoose_1 = require("mongoose");
var ClinicStatus;
(function (ClinicStatus) {
    ClinicStatus["PENDING"] = "pending";
    ClinicStatus["APPROVED"] = "approved";
    ClinicStatus["REJECTED"] = "rejected";
    ClinicStatus["SUSPENDED"] = "suspended";
})(ClinicStatus || (exports.ClinicStatus = ClinicStatus = {}));
const clinicSchema = new mongoose_1.Schema({
    clinicId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    address: { type: String, required: true },
    city: { type: String, required: true, index: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    speciality: { type: String, required: true },
    operatingHours: { type: String, required: true },
    status: { type: String, enum: Object.values(ClinicStatus), default: ClinicStatus.APPROVED },
}, { timestamps: true });
exports.Clinic = (0, mongoose_1.model)('Clinic', clinicSchema);
