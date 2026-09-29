import { Schema, model, Document } from 'mongoose';

export interface IQueueState extends Document {
  queueId: string;
  clinicId: string;
  doctorId: string;
  date: string; // YYYY-MM-DD
  currentToken: number;
  lastToken: number;
  isActive: boolean;
  updatedAt: Date;
}

const queueStateSchema = new Schema<IQueueState>(
  {
    queueId: { type: String, required: true, unique: true, index: true },
    clinicId: { type: String, required: true, index: true },
    doctorId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true },
    currentToken: { type: Number, default: 0 },
    lastToken: { type: Number, default: 0 },
    isActive: { type: Boolean, default: false },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

queueStateSchema.index({ clinicId: 1, doctorId: 1, date: 1 }, { unique: true });

export const QueueState = model<IQueueState>('QueueState', queueStateSchema);
