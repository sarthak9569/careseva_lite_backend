"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Token = exports.TokenStatus = void 0;
const mongoose_1 = require("mongoose");
var TokenStatus;
(function (TokenStatus) {
    TokenStatus["WAITING"] = "waiting";
    TokenStatus["CALLED"] = "called";
    TokenStatus["COMPLETED"] = "completed";
    TokenStatus["SKIPPED"] = "skipped";
    TokenStatus["CANCELLED"] = "cancelled";
})(TokenStatus || (exports.TokenStatus = TokenStatus = {}));
const tokenSchema = new mongoose_1.Schema({
    tokenId: { type: String, required: true, unique: true, index: true },
    clinicId: { type: String, required: true, index: true },
    doctorId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    patientPhone: { type: String, default: '' },
    date: { type: String, required: true, index: true },
    tokenNumber: { type: Number, required: true },
    status: { type: String, enum: Object.values(TokenStatus), default: TokenStatus.WAITING },
    calledAt: { type: Date },
    completedAt: { type: Date },
    skippedAt: { type: Date },
}, { timestamps: true });
tokenSchema.index({ clinicId: 1, doctorId: 1, date: 1, tokenNumber: 1 });
exports.Token = (0, mongoose_1.model)('Token', tokenSchema);
