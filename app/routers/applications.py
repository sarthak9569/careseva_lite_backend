from fastapi import APIRouter, HTTPException, status
from typing import Optional
from app.database import get_database
from app.models.application import ClinicApplicationCreate, RejectRequest
from app.models.clinic import ClinicStatus
from datetime import datetime, timezone
import random, string

router = APIRouter(prefix="/api/applications", tags=["Clinic Applications"])

@router.post("", status_code=status.HTTP_201_CREATED)
async def submit_application(payload: ClinicApplicationCreate):
    db = get_database()
    data = payload.model_dump()

    if not data.get("id"):
        data["id"] = f"APP-{random.randint(100000, 999999)}"

    data["submittedAt"] = datetime.now(timezone.utc).isoformat()
    data["status"] = ClinicStatus.PENDING

    await db["applications"].insert_one(data)
    data.pop("_id", None)
    return {"success": True, "application": data}

@router.get("")
async def get_applications(status: Optional[str] = None):
    db = get_database()
    query = {}
    if status:
        query["status"] = status

    cursor = db["applications"].find(query).sort("submittedAt", -1)
    applications = []
    async for app_doc in cursor:
        app_doc.pop("_id", None)
        applications.append(app_doc)

    return {"success": True, "applications": applications}

@router.get("/{app_id}")
async def get_application_by_id(app_id: str):
    db = get_database()
    application = await db["applications"].find_one({"id": app_id})
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    application.pop("_id", None)
    return {"success": True, "application": application}

@router.post("/{app_id}/approve")
async def approve_application(app_id: str):
    db = get_database()
    application = await db["applications"].find_one({"id": app_id})
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    clinic_id = f"CS-{''.join(random.choices(string.ascii_uppercase + string.digits, k=5))}"
    clinic_ref_num = f"REF-{''.join(random.choices(string.digits, k=5))}"
    doctor_id = f"DOC-{''.join(random.choices(string.ascii_uppercase + string.digits, k=5))}"

    clinic_data = {
        "clinicId": clinic_id,
        "clinicRefNum": clinic_ref_num,
        "name": application["clinicName"],
        "phone": application["clinicPhone"],
        "email": application.get("email", ""),
        "address": application["address"],
        "city": application["city"],
        "state": application["state"],
        "pincode": application["pincode"],
        "latitude": application["latitude"],
        "longitude": application["longitude"],
        "speciality": application["speciality"],
        "operatingHours": application["operatingHours"],
        "status": ClinicStatus.APPROVED,
        "isBookingActive": False,
        "isOpdActive": False,
        "createdAt": datetime.now(timezone.utc).isoformat()
    }
    await db["clinics"].insert_one(clinic_data)

    doctor_data = {
        "doctorId": doctor_id,
        "clinicId": clinic_id,
        "name": application["doctorName"],
        "phone": application["doctorPhone"],
        "speciality": application["doctorSpeciality"],
        "qualification": application["doctorQualification"],
        "avgConsultationMinutes": application.get("avgConsultationMinutes", 10),
        "createdAt": datetime.now(timezone.utc).isoformat()
    }
    await db["doctors"].insert_one(doctor_data)

    # Update application status
    now_str = datetime.now(timezone.utc).isoformat()
    await db["applications"].update_one(
        {"id": app_id},
        {"$set": {
            "status": ClinicStatus.APPROVED,
            "reviewedAt": now_str,
            "assignedClinicId": clinic_id,
            "assignedClinicRefNum": clinic_ref_num
        }}
    )

    application["status"] = ClinicStatus.APPROVED
    application["reviewedAt"] = now_str
    application["assignedClinicId"] = clinic_id
    application["assignedClinicRefNum"] = clinic_ref_num
    application.pop("_id", None)
    clinic_data.pop("_id", None)
    doctor_data.pop("_id", None)

    return {"success": True, "application": application, "clinic": clinic_data, "doctor": doctor_data}

@router.post("/{app_id}/reject")
async def reject_application(app_id: str, payload: RejectRequest):
    db = get_database()
    application = await db["applications"].find_one({"id": app_id})
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    now_str = datetime.now(timezone.utc).isoformat()
    await db["applications"].update_one(
        {"id": app_id},
        {"$set": {"status": ClinicStatus.REJECTED, "reviewedAt": now_str, "rejectionReason": payload.rejectionReason}}
    )

    application["status"] = ClinicStatus.REJECTED
    application["reviewedAt"] = now_str
    application["rejectionReason"] = payload.rejectionReason
    application.pop("_id", None)

    return {"success": True, "application": application}
