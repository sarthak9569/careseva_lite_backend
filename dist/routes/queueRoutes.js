"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const QueueState_1 = require("../models/QueueState");
const Token_1 = require("../models/Token");
const queueSocket_1 = require("../sockets/queueSocket");
const router = (0, express_1.Router)();
// @route   GET /api/queues/:clinicId/:date
// @desc    Get queue state and tokens for a clinic and date
router.get('/:clinicId/:date', async (req, res, next) => {
    try {
        const { clinicId, date } = req.params;
        const { doctorId } = req.query;
        const docId = doctorId || 'default';
        const queueId = `Q-${clinicId}-${docId}-${date}`;
        let queue = await QueueState_1.QueueState.findOne({ clinicId, date, doctorId: docId });
        if (!queue) {
            queue = await QueueState_1.QueueState.create({
                queueId,
                clinicId,
                doctorId: docId,
                date,
                currentToken: 0,
                lastToken: 0,
                isActive: true,
                updatedAt: new Date(),
            });
        }
        const tokens = await Token_1.Token.find({ clinicId, date }).sort({ tokenNumber: 1 });
        res.json({ success: true, queue, tokens });
    }
    catch (err) {
        next(err);
    }
});
// @route   POST /api/queues/token
// @desc    Generate new token for patient
router.post('/token', async (req, res, next) => {
    try {
        const { clinicId, doctorId, userId, patientName, patientPhone, date } = req.body;
        if (!clinicId || !userId || !date) {
            return res.status(400).json({ success: false, message: 'clinicId, userId, date are required' });
        }
        const docId = doctorId || 'default';
        const queueId = `Q-${clinicId}-${docId}-${date}`;
        let queue = await QueueState_1.QueueState.findOne({ clinicId, date, doctorId: docId });
        if (!queue) {
            queue = await QueueState_1.QueueState.create({
                queueId,
                clinicId,
                doctorId: docId,
                date,
                currentToken: 0,
                lastToken: 0,
                isActive: true,
                updatedAt: new Date(),
            });
        }
        // Atomic increment of token number
        queue.lastToken += 1;
        if (queue.currentToken === 0) {
            queue.currentToken = 1;
        }
        queue.updatedAt = new Date();
        await queue.save();
        const tokenId = `TOK-${clinicId}-${date}-${queue.lastToken}`;
        const token = await Token_1.Token.create({
            tokenId,
            clinicId,
            doctorId: docId,
            userId,
            patientName: patientName || 'Patient',
            patientPhone: patientPhone || '',
            date,
            tokenNumber: queue.lastToken,
            status: Token_1.TokenStatus.WAITING,
        });
        const io = req.app.get('io');
        if (io) {
            (0, queueSocket_1.emitQueueUpdate)(io, clinicId, date, { queue });
            (0, queueSocket_1.emitTokenUpdate)(io, clinicId, date, { token });
        }
        res.status(201).json({ success: true, token, queue });
    }
    catch (err) {
        next(err);
    }
});
// @route   POST /api/queues/toggle-active
// @desc    Compounder toggle queue active status
router.post('/toggle-active', async (req, res, next) => {
    try {
        const { clinicId, date, doctorId, isActive } = req.body;
        const docId = doctorId || 'default';
        let queue = await QueueState_1.QueueState.findOne({ clinicId, date, doctorId: docId });
        if (!queue) {
            const queueId = `Q-${clinicId}-${docId}-${date}`;
            queue = await QueueState_1.QueueState.create({
                queueId,
                clinicId,
                doctorId: docId,
                date,
                currentToken: 0,
                lastToken: 0,
                isActive: isActive ?? true,
                updatedAt: new Date(),
            });
        }
        else {
            queue.isActive = isActive;
            queue.updatedAt = new Date();
            await queue.save();
        }
        const io = req.app.get('io');
        if (io) {
            (0, queueSocket_1.emitQueueUpdate)(io, clinicId, date, { queue });
        }
        res.json({ success: true, queue });
    }
    catch (err) {
        next(err);
    }
});
// @route   POST /api/queues/call-next
// @desc    Compounder call next token in queue
router.post('/call-next', async (req, res, next) => {
    try {
        const { clinicId, date, doctorId } = req.body;
        const docId = doctorId || 'default';
        const queue = await QueueState_1.QueueState.findOne({ clinicId, date, doctorId: docId });
        if (!queue) {
            return res.status(404).json({ success: false, message: 'Queue not found' });
        }
        // Find next waiting token
        const nextToken = await Token_1.Token.findOne({
            clinicId,
            date,
            status: Token_1.TokenStatus.WAITING,
        }).sort({ tokenNumber: 1 });
        if (!nextToken) {
            return res.json({ success: false, message: 'No waiting tokens in queue', queue });
        }
        nextToken.status = Token_1.TokenStatus.CALLED;
        nextToken.calledAt = new Date();
        await nextToken.save();
        queue.currentToken = nextToken.tokenNumber;
        queue.updatedAt = new Date();
        await queue.save();
        const io = req.app.get('io');
        if (io) {
            (0, queueSocket_1.emitQueueUpdate)(io, clinicId, date, { queue });
            (0, queueSocket_1.emitTokenUpdate)(io, clinicId, date, { token: nextToken });
        }
        res.json({ success: true, queue, calledToken: nextToken });
    }
    catch (err) {
        next(err);
    }
});
// @route   PATCH /api/queues/token/:tokenId/status
// @desc    Update token status (complete, skip, cancel)
router.patch('/token/:tokenId/status', async (req, res, next) => {
    try {
        const { tokenId } = req.params;
        const { status } = req.body;
        const token = await Token_1.Token.findOne({ tokenId });
        if (!token) {
            return res.status(404).json({ success: false, message: 'Token not found' });
        }
        token.status = status;
        const now = new Date();
        if (status === Token_1.TokenStatus.COMPLETED)
            token.completedAt = now;
        if (status === Token_1.TokenStatus.SKIPPED)
            token.skippedAt = now;
        await token.save();
        const io = req.app.get('io');
        if (io) {
            (0, queueSocket_1.emitTokenUpdate)(io, token.clinicId, token.date, { token });
        }
        res.json({ success: true, token });
    }
    catch (err) {
        next(err);
    }
});
// @route   GET /api/queues/user/:userId
// @desc    Get active/past tokens for patient
router.get('/user/:userId', async (req, res, next) => {
    try {
        const tokens = await Token_1.Token.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json({ success: true, tokens });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
