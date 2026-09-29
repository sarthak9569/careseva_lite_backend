from pydantic import BaseModel
from typing import Optional
from enum import Enum

class ClinicStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    SUSPENDED = "suspended"

class ClinicBase(BaseModel):
    clinicId: str
    name: str
    phone: str
    email: str = ""
    address: str
    city: str
    state: str
    pincode: str
    latitude: float
    longitude: float
    speciality: str
    operatingHours: str
    status: ClinicStatus = ClinicStatus.APPROVED

class ClinicCreate(BaseModel):
    clinicId: Optional[str] = None
    name: str
    phone: str
    email: Optional[str] = ""
    address: str
    city: str
    state: str
    pincode: str
    latitude: float
    longitude: float
    speciality: str
    operatingHours: str
    status: Optional[ClinicStatus] = ClinicStatus.APPROVED

class StatusUpdate(BaseModel):
    status: ClinicStatus
