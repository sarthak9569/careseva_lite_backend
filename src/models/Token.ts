import { Schema, model, Document } from 'mongoose';

export enum TokenStatus {
  WAITING = 'waiting',
  CALLED = 'called',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
  CANCELLED = 'cancelled',
}

export interface IToken extends Document {
  tokenId: string;
  clinicId: string;
  doctorId: string;
  userId: string;
  patientName: string;
  patientPhone: string;
  date: string; // YYYY-MM-DD
  tokenNumber: number;
  status: TokenStatus;
  createdAt: Date;
  calledAt?: Date;
  completedAt?: Date;
  skippedAt?: Date;
}

const tokenSchema = new Schema<IToken>(
  {
    tokenId: { type: String, required: true, unique: true, index: true },
    clinicId: { type: String, required: true, index: true },
    doctorId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    patientPhone: { type: String, default: '' },
    date: { type: String, required: true, index: true },
    tokenNumber: { type: Number, required: true },
    status: { type: String, enum: Object.values(TokenStatus), default: TokenStatus.WAITING },
    calledAt: { type: Date },
    completedAt: { type: Date },
    skippedAt: { type: Date },
  },
  { timestamps: true }
);

tokenSchema.index({ clinicId: 1, doctorId: 1, date: 1, tokenNumber: 1 });

export const Token = model<IToken>('Token', tokenSchema);
