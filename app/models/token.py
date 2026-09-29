from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum
from datetime import datetime, timezone

class TokenStatus(str, Enum):
    WAITING = "waiting"
    CALLED = "called"
    COMPLETED = "completed"
    SKIPPED = "skipped"
    CANCELLED = "cancelled"

class TokenBase(BaseModel):
    tokenId: str
    clinicId: str
    doctorId: str
    userId: str
    patientName: str
    patientPhone: str = ""
    date: str
    tokenNumber: int
    status: TokenStatus = TokenStatus.WAITING
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    calledAt: Optional[datetime] = None
    completedAt: Optional[datetime] = None
    skippedAt: Optional[datetime] = None

class TokenCreateRequest(BaseModel):
    clinicId: str
    doctorId: Optional[str] = "default"
    userId: str
    patientName: Optional[str] = "Patient"
    patientPhone: Optional[str] = ""
    date: str

class TokenStatusUpdateRequest(BaseModel):
    status: TokenStatus
