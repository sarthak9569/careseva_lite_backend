import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import sys
from datetime import datetime, timezone

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/careseva")
DB_NAME = os.getenv("DB_NAME", "careseva")

async def seed_data():
    print(f"🌱 Connecting to MongoDB ({MONGO_URI})...")
    client = AsyncIOMotorClient(MONGO_URI, serverSelectionTimeoutMS=3000)
    db = client[DB_NAME]

    try:
        # Ping server to test connection immediately
        await client.admin.command('ping')
        print("✅ Connected to MongoDB server.")
    except Exception as e:
        print("\n❌ Could not connect to MongoDB!")
        print("💡 Solution Checklist:")
        print("  1. If running MongoDB locally: Ensure MongoDB service is started (e.g., 'net start MongoDB' or MongoDB Compass).")
        print("  2. If using Cloud MongoDB (MongoDB Atlas / Railway): Add your MONGO_URI string into your '.env' file:")
        print("     MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/careseva?retryWrites=true&w=majority")
        print(f"\nExact Error Detail: {e}\n")
        return

    # Clean existing collections
    await db["users"].delete_many({})
    await db["clinics"].delete_many({})
    await db["doctors"].delete_many({})
    await db["applications"].delete_many({})
    await db["queues"].delete_many({})
    await db["tokens"].delete_many({})

    print("🧹 Cleared existing database collections.")

    # Create Sample Users
    users = [
        {
            "userId": "USR-1001",
            "name": "Rahul Sharma",
            "phone": "9876543210",
            "age": 28,
            "gender": "Male",
            "role": "patient",
            "createdAt": datetime.now(timezone.utc).isoformat()
        },
        {
            "userId": "USR-1002",
            "name": "Priya Verma",
            "phone": "9876543211",
            "age": 32,
            "gender": "Female",
            "role": "compounder",
            "createdAt": datetime.now(timezone.utc).isoformat()
        },
        {
            "userId": "USR-ADMIN",
            "name": "CareSeva Admin",
            "phone": "9999999999",
            "age": 35,
            "gender": "Other",
            "role": "admin",
            "createdAt": datetime.now(timezone.utc).isoformat()
        }
    ]
    await db["users"].insert_many(users)

    # Create Sample Clinics
    clinics = [
        {
            "clinicId": "CS-7K82P",
            "clinicRefNum": "REF-78291",
            "name": "Arogya Care Clinic",
            "phone": "+91 98765 43210",
            "email": "arogya@careseva.org",
            "address": "102 Civil Lines, Near Metro Station",
            "city": "Jaipur",
            "state": "Rajasthan",
            "pincode": "302006",
            "latitude": 26.9124,
            "longitude": 75.7873,
            "speciality": "General Medicine & Pediatrics",
            "operatingHours": "09:00 AM - 08:00 PM",
            "status": "approved",
            "isBookingActive": True,
            "isOpdActive": True,
            "createdAt": datetime.now(timezone.utc).isoformat()
        },
        {
            "clinicId": "CS-9M41X",
            "clinicRefNum": "REF-94102",
            "name": "Sanjeevani Multispeciality",
            "phone": "+91 98123 45678",
            "email": "sanjeevani@careseva.org",
            "address": "45 MG Road, Opposite Bus Stand",
            "city": "Indore",
            "state": "Madhya Pradesh",
            "pincode": "452001",
            "latitude": 22.7196,
            "longitude": 75.8577,
            "speciality": "Cardiology & Internal Medicine",
            "operatingHours": "10:00 AM - 07:00 PM",
            "status": "approved",
            "isBookingActive": False,
            "isOpdActive": False,
            "createdAt": datetime.now(timezone.utc).isoformat()
        }
    ]
    await db["clinics"].insert_many(clinics)

    # Create Sample Doctors
    doctors = [
        {
            "doctorId": "DOC-101",
            "clinicId": "CS-7K82P",
            "name": "Dr. Rajesh Sharma",
            "phone": "+91 98765 43210",
            "speciality": "General Physician",
            "qualification": "MBBS, MD (Internal Medicine)",
            "avgConsultationMinutes": 10,
            "createdAt": datetime.now(timezone.utc).isoformat()
        },
        {
            "doctorId": "DOC-102",
            "clinicId": "CS-9M41X",
            "name": "Dr. Ananya Gupta",
            "phone": "+91 98123 45678",
            "speciality": "Cardiologist",
            "qualification": "MBBS, DM (Cardiology)",
            "avgConsultationMinutes": 15,
            "createdAt": datetime.now(timezone.utc).isoformat()
        }
    ]
    await db["doctors"].insert_many(doctors)

    print("✅ Seed completed successfully!")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_data())
