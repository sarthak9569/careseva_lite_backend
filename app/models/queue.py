from pydantic import BaseModel, Field
from datetime import datetime, timezone
from typing import Optional

class QueueStateBase(BaseModel):
    queueId: str
    clinicId: str
    doctorId: str
    date: str # YYYY-MM-DD
    currentToken: int = 0
    lastToken: int = 0
    isActive: bool = False
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ToggleActiveRequest(BaseModel):
    clinicId: str
    date: str
    doctorId: Optional[str] = "default"
    isActive: bool

class CallNextRequest(BaseModel):
    clinicId: str
    date: str
    doctorId: Optional[str] = "default"
