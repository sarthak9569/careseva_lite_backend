from pydantic import BaseModel
from typing import Optional

class DoctorBase(BaseModel):
    doctorId: str
    clinicId: str
    name: str
    phone: str
    speciality: str
    qualification: str
    avgConsultationMinutes: int = 10

class DoctorCreate(BaseModel):
    doctorId: Optional[str] = None
    clinicId: Optional[str] = None
    name: str
    phone: str
    speciality: str
    qualification: str
    avgConsultationMinutes: Optional[int] = 10
