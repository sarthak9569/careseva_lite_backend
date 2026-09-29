import { Schema, model, Document } from 'mongoose';
import { ClinicStatus } from './Clinic';

export interface IClinicApplication extends Document {
  id: string;
  clinicName: string;
  clinicPhone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  speciality: string;
  operatingHours: string;

  doctorName: string;
  doctorPhone: string;
  doctorSpeciality: string;
  doctorQualification: string;
  doctorRegNum: string;
  avgConsultationMinutes: number;

  status: ClinicStatus;
  submittedAt: Date;
  reviewedAt?: Date;
  assignedClinicId?: string;
  rejectionReason?: string;
}

const clinicApplicationSchema = new Schema<IClinicApplication>(
  {
    id: { type: String, required: true, unique: true, index: true },
    clinicName: { type: String, required: true },
    clinicPhone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    speciality: { type: String, required: true },
    operatingHours: { type: String, required: true },

    doctorName: { type: String, required: true },
    doctorPhone: { type: String, required: true },
    doctorSpeciality: { type: String, required: true },
    doctorQualification: { type: String, required: true },
    doctorRegNum: { type: String, required: true },
    avgConsultationMinutes: { type: Number, default: 10 },

    status: { type: String, enum: Object.values(ClinicStatus), default: ClinicStatus.PENDING },
    submittedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date },
    assignedClinicId: { type: String },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

export const ClinicApplication = model<IClinicApplication>('ClinicApplication', clinicApplicationSchema);
