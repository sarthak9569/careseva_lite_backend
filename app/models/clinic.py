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
    clinicRefNum: str
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
    isBookingActive: bool = False
    isOpdActive: bool = False

class ClinicCreate(BaseModel):
    clinicId: Optional[str] = None
    clinicRefNum: Optional[str] = None
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
    isBookingActive: Optional[bool] = False
    isOpdActive: Optional[bool] = False

class StatusUpdate(BaseModel):
    status: ClinicStatus

class ToggleActiveRequest(BaseModel):
    isBookingActive: Optional[bool] = None
    isOpdActive: Optional[bool] = None
