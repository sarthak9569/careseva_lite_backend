"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueState = void 0;
const mongoose_1 = require("mongoose");
const queueStateSchema = new mongoose_1.Schema({
    queueId: { type: String, required: true, unique: true, index: true },
    clinicId: { type: String, required: true, index: true },
    doctorId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true },
    currentToken: { type: Number, default: 0 },
    lastToken: { type: Number, default: 0 },
    isActive: { type: Boolean, default: false },
    updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });
queueStateSchema.index({ clinicId: 1, doctorId: 1, date: 1 }, { unique: true });
exports.QueueState = (0, mongoose_1.model)('QueueState', queueStateSchema);
