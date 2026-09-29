"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./config/db");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const clinicRoutes_1 = __importDefault(require("./routes/clinicRoutes"));
const applicationRoutes_1 = __importDefault(require("./routes/applicationRoutes"));
const queueRoutes_1 = __importDefault(require("./routes/queueRoutes"));
const queueSocket_1 = require("./sockets/queueSocket");
const errorHandler_1 = require("./middleware/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const corsOrigin = process.env.CORS_ORIGIN || '*';
const io = new socket_io_1.Server(server, {
    cors: {
        origin: corsOrigin,
        methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    },
});
app.set('io', io);
// Middleware
app.use((0, cors_1.default)({ origin: corsOrigin }));
app.use(express_1.default.json());
// Healthcheck Route for Railway / Monitoring
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        service: 'CareSeva MongoDB Railway Backend',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV || 'development',
    });
});
// API Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/clinics', clinicRoutes_1.default);
app.use('/api/applications', applicationRoutes_1.default);
app.use('/api/queues', queueRoutes_1.default);
// Socket.io Sockets Setup
(0, queueSocket_1.setupQueueSockets)(io);
// Global Error Handler Middleware
app.use(errorHandler_1.errorHandler);
// Connect MongoDB and Start Server
const PORT = process.env.PORT || 5000;
(0, db_1.connectDB)().then(() => {
    server.listen(PORT, () => {
        console.log(`🚀 CareSeva Backend Server listening on port ${PORT}`);
        console.log(`📡 CORS Origin configured to: ${corsOrigin}`);
        console.log(`🩺 Health check URL: http://localhost:${PORT}/health`);
    });
});
