import { Schema, model, Document } from 'mongoose';

export enum UserRole {
  PATIENT = 'patient',
  COMPOUNDER = 'compounder',
  ADMIN = 'admin',
  DOCTOR = 'doctor',
}

export interface IUser extends Document {
  userId: string;
  name: string;
  phone: string;
  age: number;
  gender: string;
  role: UserRole;
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    phone: { type: String, required: true, index: true },
    age: { type: Number, default: 25 },
    gender: { type: String, default: 'Other' },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.PATIENT },
  },
  { timestamps: true }
);

export const User = model<IUser>('User', userSchema);
