"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = require("../models/User");
const router = (0, express_1.Router)();
// @route   POST /api/auth/login
// @desc    Authenticate user by phone or create default profile
router.post('/login', async (req, res, next) => {
    try {
        const { phone, role, name, age, gender } = req.body;
        if (!phone) {
            return res.status(400).json({ success: false, message: 'Phone number is required' });
        }
        let user = await User_1.User.findOne({ phone });
        if (!user) {
            const generatedUserId = `USR-${Math.floor(100000 + Math.random() * 900000)}`;
            user = await User_1.User.create({
                userId: generatedUserId,
                phone,
                name: name || `User ${phone.slice(-4)}`,
                age: age || 25,
                gender: gender || 'Other',
                role: role || User_1.UserRole.PATIENT,
            });
        }
        res.json({ success: true, user });
    }
    catch (err) {
        next(err);
    }
});
// @route   POST /api/auth/profile
// @desc    Update or create user profile
router.post('/profile', async (req, res, next) => {
    try {
        const { userId, name, phone, age, gender, role } = req.body;
        if (!userId || !phone) {
            return res.status(400).json({ success: false, message: 'userId and phone are required' });
        }
        const updatedUser = await User_1.User.findOneAndUpdate({ userId }, { name, phone, age, gender, role }, { new: true, upsert: true });
        res.json({ success: true, user: updatedUser });
    }
    catch (err) {
        next(err);
    }
});
// @route   GET /api/auth/user/:userId
// @desc    Get user profile by userId
router.get('/user/:userId', async (req, res, next) => {
    try {
        const user = await User_1.User.findOne({ userId: req.params.userId });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, user });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
