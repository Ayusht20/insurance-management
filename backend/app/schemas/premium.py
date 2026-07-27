from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class PremiumCreate(BaseModel):
    policy_id: int
    payment_date: date
    amount: float

class PremiumUpdate(BaseModel):
    payment_status: Optional[str] = None

class PremiumOut(BaseModel):
    id: int
    policy_id: int
    payment_date: date
    amount: float
    payment_status: str
    created_at: datetime

    class Config:
        from_attributes = True