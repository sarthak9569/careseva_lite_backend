from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.database import get_database
from app.models.clinic import ClinicCreate, ClinicStatus, StatusUpdate
from app.models.doctor import DoctorCreate
import random, string

router = APIRouter(prefix="/api/clinics", tags=["Clinics & Doctors"])

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
        ]

    cursor = db["clinics"].find(query).sort("createdAt", -1)
    clinics = []
    async for doc in cursor:
        doc.pop("_id", None)
        clinics.append(doc)

    return {"success": True, "clinics": clinics}

@router.get("/{clinic_id}")
async def get_clinic_by_id(clinic_id: str):
    db = get_database()
    clinic = await db["clinics"].find_one({"clinicId": clinic_id})
    if not clinic:
        raise HTTPException(status_code=404, detail="Clinic not found")

    clinic.pop("_id", None)

    doctors_cursor = db["doctors"].find({"clinicId": clinic_id})
    doctors = []
    async for d in doctors_cursor:
        d.pop("_id", None)
        doctors.append(d)

    return {"success": True, "clinic": clinic, "doctors": doctors}

@router.post("")
async def create_or_update_clinic(payload: ClinicCreate):
    db = get_database()
    data = payload.model_dump()
    if not data.get("clinicId"):
        rand_str = "".join(random.choices(string.ascii_uppercase + string.digits, k=5))
        data["clinicId"] = f"CS-{rand_str}"

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
