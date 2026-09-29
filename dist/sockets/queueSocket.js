"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitTokenUpdate = exports.emitQueueUpdate = exports.setupQueueSockets = void 0;
const setupQueueSockets = (io) => {
    io.on('connection', (socket) => {
        console.log(`🔌 Socket connected: ${socket.id}`);
        // Join room for real-time queue updates by clinic and date
        socket.on('join_queue', (data) => {
            const room = `queue_${data.clinicId}_${data.date}`;
            socket.join(room);
            console.log(`📡 Socket ${socket.id} joined room: ${room}`);
        });
        // Leave queue room
        socket.on('leave_queue', (data) => {
            const room = `queue_${data.clinicId}_${data.date}`;
            socket.leave(room);
            console.log(`📡 Socket ${socket.id} left room: ${room}`);
        });
        socket.on('disconnect', () => {
            console.log(`🔌 Socket disconnected: ${socket.id}`);
        });
    });
};
exports.setupQueueSockets = setupQueueSockets;
const emitQueueUpdate = (io, clinicId, date, payload) => {
    const room = `queue_${clinicId}_${date}`;
    io.to(room).emit('queue_updated', payload);
};
exports.emitQueueUpdate = emitQueueUpdate;
const emitTokenUpdate = (io, clinicId, date, payload) => {
    const room = `queue_${clinicId}_${date}`;
    io.to(room).emit('token_updated', payload);
};
exports.emitTokenUpdate = emitTokenUpdate;
