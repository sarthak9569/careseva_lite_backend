import express, { Request, Response } from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import clinicRoutes from './routes/clinicRoutes';
import applicationRoutes from './routes/applicationRoutes';
import queueRoutes from './routes/queueRoutes';
import { setupQueueSockets } from './sockets/queueSocket';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const server = http.createServer(app);

const corsOrigin = process.env.CORS_ORIGIN || '*';

const io = new SocketIOServer(server, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  },
});

app.set('io', io);

// Middleware
app.use(cors({ origin: corsOrigin }));
app.use(express.json());

// Healthcheck Route for Railway / Monitoring
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    service: 'CareSeva MongoDB Railway Backend',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/queues', queueRoutes);

// Socket.io Sockets Setup
setupQueueSockets(io);

// Global Error Handler Middleware
app.use(errorHandler);

// Connect MongoDB and Start Server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 CareSeva Backend Server listening on port ${PORT}`);
    console.log(`📡 CORS Origin configured to: ${corsOrigin}`);
    console.log(`🩺 Health check URL: http://localhost:${PORT}/health`);
  });
});
