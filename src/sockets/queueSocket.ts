import { Server as SocketIOServer, Socket } from 'socket.io';

export const setupQueueSockets = (io: SocketIOServer) => {
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Join room for real-time queue updates by clinic and date
    socket.on('join_queue', (data: { clinicId: string; date: string }) => {
      const room = `queue_${data.clinicId}_${data.date}`;
      socket.join(room);
      console.log(`📡 Socket ${socket.id} joined room: ${room}`);
    });

    // Leave queue room
    socket.on('leave_queue', (data: { clinicId: string; date: string }) => {
      const room = `queue_${data.clinicId}_${data.date}`;
      socket.leave(room);
      console.log(`📡 Socket ${socket.id} left room: ${room}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};

export const emitQueueUpdate = (io: SocketIOServer, clinicId: string, date: string, payload: any) => {
  const room = `queue_${clinicId}_${date}`;
  io.to(room).emit('queue_updated', payload);
};

export const emitTokenUpdate = (io: SocketIOServer, clinicId: string, date: string, payload: any) => {
  const room = `queue_${clinicId}_${date}`;
  io.to(room).emit('token_updated', payload);
};
