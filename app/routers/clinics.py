from fastapi import APIRouter, HTTPException, Query, status
from typing import Optional
from pydantic import BaseModel
from app.database import get_database
from app.models.clinic import ClinicCreate, ClinicStatus, StatusUpdate
from app.models.doctor import DoctorCreate
from app.sockets.manager import ws_manager
import random, string

router = APIRouter(prefix="/api/clinics", tags=["Clinics & Doctors"])

class OtpVerifyRequest(BaseModel):
    otp: str

class ToggleRequest(BaseModel):
    state: bool

@router.get("")
async def get_clinics(
    search: Optional[str] = None,
    city: Optional[str] = None,
    status: Optional[str] = ClinicStatus.APPROVED
):
    db = get_database()
    query = {}
    if status:
        query["status"] = status
    if city:
        query["city"] = {"$regex": city, "$options": "i"}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"speciality": {"$regex": search, "$options": "i"}},
            {"city": {"$regex": search, "$options": "i"}},
            {"clinicId": {"$regex": search, "$options": "i"}},
            {"clinicRefNum": {"$regex": search, "$options": "i"}},
        ]

    cursor = db["clinics"].find(query).sort("createdAt", -1)
    clinics = []
    async for doc in cursor:
        doc.pop("_id", None)
        clinics.append(doc)

    return {"success": True, "clinics": clinics}

@router.get("/lookup/{identifier}")
async def get_clinic_by_identifier(identifier: str):
    db = get_database()
    clean_id = identifier.strip().upper()

    clinic = await db["clinics"].find_one({
        "$or": [
            {"clinicId": clean_id},
            {"clinicRefNum": clean_id}
        ]
    })

    if not clinic:
        raise HTTPException(status_code=404, detail=f"Clinic with ID/Ref '{identifier}' not found")

    clinic.pop("_id", None)
    doctors_cursor = db["doctors"].find({"clinicId": clinic["clinicId"]})
    doctors = []
    async for d in doctors_cursor:
        d.pop("_id", None)
        doctors.append(d)

    return {"success": True, "clinic": clinic, "doctors": doctors}

@router.get("/{clinic_id}")
async def get_clinic_by_id(clinic_id: str):
    return await get_clinic_by_identifier(clinic_id)

@router.post("/{clinic_id}/send-compounder-otp")
async def send_compounder_otp(clinic_id: str):
    db = get_database()
    clean_id = clinic_id.strip().upper()
    clinic = await db["clinics"].find_one({"$or": [{"clinicId": clean_id}, {"clinicRefNum": clean_id}]})

    if not clinic:
        raise HTTPException(status_code=404, detail="Clinic not found")

    clinic_phone = clinic.get("phone", "")
    masked_phone = f"******{clinic_phone[-4:]}" if len(clinic_phone) >= 4 else clinic_phone

    # In production integration with SMS Gateway (e.g. Twilio/Fast2SMS), this sends real SMS.
    # Simulated OTP: '123456'
    return {
        "success": True,
        "message": f"OTP sent to clinic registered phone number ({masked_phone})",
        "clinicPhone": masked_phone,
        "demoOtp": "123456"
    }

@router.post("/{clinic_id}/verify-compounder-otp")
async def verify_compounder_otp(clinic_id: str, payload: OtpVerifyRequest):
    db = get_database()
    clean_id = clinic_id.strip().upper()
    clinic = await db["clinics"].find_one({"$or": [{"clinicId": clean_id}, {"clinicRefNum": clean_id}]})

    if not clinic:
        raise HTTPException(status_code=404, detail="Clinic not found")

    if payload.otp != "123456":
        raise HTTPException(status_code=400, detail="Invalid OTP code")

    clinic.pop("_id", None)
    return {"success": True, "message": "Compounder verified successfully", "clinic": clinic}

@router.post("/{clinic_id}/toggle-booking")
async def toggle_clinic_booking(clinic_id: str, payload: ToggleRequest):
    db = get_database()
    clean_id = clinic_id.strip().upper()

    clinic = await db["clinics"].find_one_and_update(
        {"$or": [{"clinicId": clean_id}, {"clinicRefNum": clean_id}]},
        {"$set": {"isBookingActive": payload.state}},
        return_document=True
    )
    if not clinic:
        raise HTTPException(status_code=404, detail="Clinic not found")

    clinic.pop("_id", None)
    room = f"clinic_{clinic['clinicId']}"
    await ws_manager.broadcast_to_room(room, {"type": "booking_toggled", "isBookingActive": payload.state})

    return {"success": True, "clinic": clinic}

@router.post("/{clinic_id}/toggle-opd")
async def toggle_clinic_opd(clinic_id: str, payload: ToggleRequest):
    db = get_database()
    clean_id = clinic_id.strip().upper()

    clinic = await db["clinics"].find_one_and_update(
        {"$or": [{"clinicId": clean_id}, {"clinicRefNum": clean_id}]},
        {"$set": {"isOpdActive": payload.state}},
        return_document=True
    )
    if not clinic:
        raise HTTPException(status_code=404, detail="Clinic not found")

    clinic.pop("_id", None)
    room = f"clinic_{clinic['clinicId']}"
    await ws_manager.broadcast_to_room(room, {"type": "opd_toggled", "isOpdActive": payload.state})

    return {"success": True, "clinic": clinic}

@router.post("")
async def create_or_update_clinic(payload: ClinicCreate):
    db = get_database()
    data = payload.model_dump()
    if not data.get("clinicId"):
        rand_str = "".join(random.choices(string.ascii_uppercase + string.digits, k=5))
        data["clinicId"] = f"CS-{rand_str}"
    if not data.get("clinicRefNum"):
        rand_ref = "".join(random.choices(string.digits, k=5))
        data["clinicRefNum"] = f"REF-{rand_ref}"

    updated = await db["clinics"].find_one_and_update(
        {"clinicId": data["clinicId"]},
        {"$set": data},
        upsert=True,
        return_document=True
    )
    updated.pop("_id", None)
    return {"success": True, "clinic": updated}

@router.patch("/{clinic_id}/status")
async def update_clinic_status(clinic_id: str, payload: StatusUpdate):
    db = get_database()
    clinic = await db["clinics"].find_one_and_update(
        {"clinicId": clinic_id},
        {"$set": {"status": payload.status}},
        return_document=True
    )
    if not clinic:
        raise HTTPException(status_code=404, detail="Clinic not found")

    clinic.pop("_id", None)
    return {"success": True, "clinic": clinic}

@router.get("/{clinic_id}/doctors")
async def get_clinic_doctors(clinic_id: str):
    db = get_database()
    cursor = db["doctors"].find({"clinicId": clinic_id})
    doctors = []
    async for d in cursor:
        d.pop("_id", None)
        doctors.append(d)

    return {"success": True, "doctors": doctors}

@router.post("/{clinic_id}/doctors")
async def add_or_update_doctor(clinic_id: str, payload: DoctorCreate):
    db = get_database()
    data = payload.model_dump()
    data["clinicId"] = clinic_id

    if not data.get("doctorId"):
        rand_str = "".join(random.choices(string.ascii_uppercase + string.digits, k=5))
        data["doctorId"] = f"DOC-{rand_str}"

    updated = await db["doctors"].find_one_and_update(
        {"doctorId": data["doctorId"]},
        {"$set": data},
        upsert=True,
        return_document=True
    )
    updated.pop("_id", None)
    return {"success": True, "doctor": updated}
