"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.UserRole = void 0;
const mongoose_1 = require("mongoose");
var UserRole;
(function (UserRole) {
    UserRole["PATIENT"] = "patient";
    UserRole["COMPOUNDER"] = "compounder";
    UserRole["ADMIN"] = "admin";
    UserRole["DOCTOR"] = "doctor";
})(UserRole || (exports.UserRole = UserRole = {}));
const userSchema = new mongoose_1.Schema({
    userId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    phone: { type: String, required: true, index: true },
    age: { type: Number, default: 25 },
    gender: { type: String, default: 'Other' },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.PATIENT },
}, { timestamps: true });
exports.User = (0, mongoose_1.model)('User', userSchema);
