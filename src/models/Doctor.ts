import { Schema, model, Document } from 'mongoose';

export interface IDoctor extends Document {
  doctorId: string;
  clinicId: string;
  name: string;
  phone: string;
  speciality: string;
  qualification: string;
  avgConsultationMinutes: number;
}

const doctorSchema = new Schema<IDoctor>(
  {
    doctorId: { type: String, required: true, unique: true, index: true },
    clinicId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    speciality: { type: String, required: true },
    qualification: { type: String, required: true },
    avgConsultationMinutes: { type: Number, default: 10 },
  },
  { timestamps: true }
);

export const Doctor = model<IDoctor>('Doctor', doctorSchema);
