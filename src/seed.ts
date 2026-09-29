import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Clinic, ClinicStatus } from './models/Clinic';
import { Doctor } from './models/Doctor';
import { User, UserRole } from './models/User';
import { QueueState } from './models/QueueState';
import { Token, TokenStatus } from './models/Token';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/careseva';

const seedData = async () => {
  try {
    console.log('🌱 Connecting to MongoDB for seeding...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB.');

    // Clear existing collections
    await Clinic.deleteMany({});
    await Doctor.deleteMany({});
    await User.deleteMany({});
    await QueueState.deleteMany({});
    await Token.deleteMany({});

    console.log('🧹 Cleaned existing database collections.');

    // Create Sample Users
    const users = await User.insertMany([
      {
        userId: 'USR-1001',
        name: 'Rahul Sharma',
        phone: '9876543210',
        age: 28,
        gender: 'Male',
        role: UserRole.PATIENT,
      },
      {
        userId: 'USR-1002',
        name: 'Priya Verma',
        phone: '9876543211',
        age: 32,
        gender: 'Female',
        role: UserRole.COMPOUNDER,
      },
      {
        userId: 'USR-ADMIN',
        name: 'CareSeva Admin',
        phone: '9999999999',
        age: 35,
        gender: 'Other',
        role: UserRole.ADMIN,
      },
    ]);

    // Create Sample Clinics
    const clinics = await Clinic.insertMany([
      {
        clinicId: 'CS-7K82P',
        name: 'Arogya Care Clinic',
        phone: '+91 98765 43210',
        email: 'arogya@careseva.org',
        address: '102 Civil Lines, Near Metro Station',
        city: 'Jaipur',
        state: 'Rajasthan',
        pincode: '302006',
        latitude: 26.9124,
        longitude: 75.7873,
        speciality: 'General Medicine & Pediatrics',
        operatingHours: '09:00 AM - 08:00 PM',
        status: ClinicStatus.APPROVED,
      },
      {
        clinicId: 'CS-9M41X',
        name: 'Sanjeevani Multispeciality',
        phone: '+91 98123 45678',
        email: 'sanjeevani@careseva.org',
        address: '45 MG Road, Opposite Bus Stand',
        city: 'Indore',
        state: 'Madhya Pradesh',
        pincode: '452001',
        latitude: 22.7196,
        longitude: 75.8577,
        speciality: 'Cardiology & Internal Medicine',
        operatingHours: '10:00 AM - 07:00 PM',
        status: ClinicStatus.APPROVED,
      },
    ]);

    // Create Sample Doctors
    const doctors = await Doctor.insertMany([
      {
        doctorId: 'DOC-101',
        clinicId: 'CS-7K82P',
        name: 'Dr. Rajesh Sharma',
        phone: '+91 98765 43210',
        speciality: 'General Physician',
        qualification: 'MBBS, MD (Internal Medicine)',
        avgConsultationMinutes: 10,
      },
      {
        doctorId: 'DOC-102',
        clinicId: 'CS-9M41X',
        name: 'Dr. Ananya Gupta',
        phone: '+91 98123 45678',
        speciality: 'Cardiologist',
        qualification: 'MBBS, DM (Cardiology)',
        avgConsultationMinutes: 15,
      },
    ]);

    const todayStr = new Date().toISOString().split('T')[0];

    // Create Sample Queue State
    const queue = await QueueState.create({
      queueId: `Q-CS-7K82P-DOC-101-${todayStr}`,
      clinicId: 'CS-7K82P',
      doctorId: 'DOC-101',
      date: todayStr,
      currentToken: 2,
      lastToken: 5,
      isActive: true,
      updatedAt: new Date(),
    });

    // Create Sample Tokens
    await Token.insertMany([
      {
        tokenId: `TOK-CS-7K82P-${todayStr}-1`,
        clinicId: 'CS-7K82P',
        doctorId: 'DOC-101',
        userId: 'USR-1001',
        patientName: 'Rahul Sharma',
        patientPhone: '9876543210',
        date: todayStr,
        tokenNumber: 1,
        status: TokenStatus.COMPLETED,
        calledAt: new Date(Date.now() - 1000 * 60 * 30),
        completedAt: new Date(Date.now() - 1000 * 60 * 15),
      },
      {
        tokenId: `TOK-CS-7K82P-${todayStr}-2`,
        clinicId: 'CS-7K82P',
        doctorId: 'DOC-101',
        userId: 'USR-1001',
        patientName: 'Pooja Sharma',
        patientPhone: '9876543210',
        date: todayStr,
        tokenNumber: 2,
        status: TokenStatus.CALLED,
        calledAt: new Date(Date.now() - 1000 * 60 * 5),
      },
      {
        tokenId: `TOK-CS-7K82P-${todayStr}-3`,
        clinicId: 'CS-7K82P',
        doctorId: 'DOC-101',
        userId: 'USR-1001',
        patientName: 'Amit Verma',
        patientPhone: '9876543211',
        date: todayStr,
        tokenNumber: 3,
        status: TokenStatus.WAITING,
      },
    ]);

    console.log('✅ Seed completed successfully!');
    console.log(`- Sample Users: ${users.length}`);
    console.log(`- Sample Clinics: ${clinics.length}`);
    console.log(`- Sample Doctors: ${doctors.length}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedData();
