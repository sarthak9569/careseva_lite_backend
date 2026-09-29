from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone
from app.models.clinic import ClinicStatus

class ClinicApplicationBase(BaseModel):
    id: str
    clinicName: str
    clinicPhone: str
    email: str
    address: str
    city: str
    state: str
    pincode: str
    latitude: float
    longitude: float
    speciality: str
    operatingHours: str

    doctorName: str
    doctorPhone: str
    doctorSpeciality: str
    doctorQualification: str
    doctorRegNum: str
    avgConsultationMinutes: int = 10

    status: ClinicStatus = ClinicStatus.PENDING
    submittedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    reviewedAt: Optional[datetime] = None
    assignedClinicId: Optional[str] = None
    assignedClinicRefNum: Optional[str] = None
    rejectionReason: Optional[str] = None

class ClinicApplicationCreate(BaseModel):
    id: Optional[str] = None
    clinicName: str
    clinicPhone: str
    email: str
    address: str
    city: str
    state: str
    pincode: str
    latitude: float
    longitude: float
    speciality: str
    operatingHours: str

    doctorName: str
    doctorPhone: str
    doctorSpeciality: str
    doctorQualification: str
    doctorRegNum: str
    avgConsultationMinutes: Optional[int] = 10

class RejectRequest(BaseModel):
    rejectionReason: str
