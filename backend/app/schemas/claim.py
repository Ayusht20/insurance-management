from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class ClaimCreate(BaseModel):
    policy_id: int
    claim_amount: float
    reason: str

class ClaimStatusUpdate(BaseModel):
    status: str  # "approved" | "rejected"

class ClaimOut(BaseModel):
    id: int
    policy_id: int
    claim_amount: float
    reason: str
    status: str
    submission_date: date
    created_at: datetime

    class Config:
        from_attributes = True