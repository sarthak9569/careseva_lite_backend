import { Schema, model, Document } from 'mongoose';

export enum ClinicStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
}

export interface IClinic extends Document {
  clinicId: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  speciality: string;
  operatingHours: string;
  status: ClinicStatus;
}

const clinicSchema = new Schema<IClinic>(
  {
    clinicId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    address: { type: String, required: true },
    city: { type: String, required: true, index: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    speciality: { type: String, required: true },
    operatingHours: { type: String, required: true },
    status: { type: String, enum: Object.values(ClinicStatus), default: ClinicStatus.APPROVED },
  },
  { timestamps: true }
);

export const Clinic = model<IClinic>('Clinic', clinicSchema);
