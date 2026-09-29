from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum
from datetime import datetime, timezone

class UserRole(str, Enum):
    PATIENT = "patient"
    COMPOUNDER = "compounder"
    ADMIN = "admin"
    DOCTOR = "doctor"

class UserBase(BaseModel):
    userId: str
    name: str
    phone: str
    age: int = 25
    gender: str = "Other"
    role: UserRole = UserRole.PATIENT

class UserCreate(BaseModel):
    phone: str
    name: Optional[str] = None
    age: Optional[int] = 25
    gender: Optional[str] = "Other"
    role: Optional[UserRole] = UserRole.PATIENT

class UserProfileUpdate(BaseModel):
    userId: str
    name: str
    phone: str
    age: int
    gender: str
    role: UserRole

class UserResponse(UserBase):
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}
