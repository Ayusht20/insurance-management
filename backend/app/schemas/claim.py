from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class ClaimCreate(BaseModel):
    policy_id: int
    document_id: int  # supporting document is now required
    claim_amount: float
    reason: str

class ClaimStatusUpdate(BaseModel):
    status: str
    note: Optional[str] = None

class ClaimHistoryOut(BaseModel):
    id: int
    status: str
    changed_by_name: Optional[str]
    note: Optional[str]
    changed_at: datetime

    class Config:
        from_attributes = True

class ClaimOut(BaseModel):
    id: int
    claim_number: str
    policy_id: int
    document_id: Optional[int]
    claim_amount: float
    reason: str
    status: str
    submission_date: date
    created_at: datetime

    class Config:
        from_attributes = True