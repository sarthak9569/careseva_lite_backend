"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        console.warn('⚠️  MONGO_URI is not set in environment variables! Please configure MONGO_URI in Railway dashboard.');
        return;
    }
    try {
        const conn = await mongoose_1.default.connect(mongoUri);
        console.log(`✅ MongoDB Connected: ${conn.connection.host} (DB: ${conn.connection.name})`);
    }
    catch (error) {
        console.error(`❌ Database Connection Error: ${error.message}`);
        // Don't exit process in serverless / dev mode, but log clearly
    }
};
exports.connectDB = connectDB;
