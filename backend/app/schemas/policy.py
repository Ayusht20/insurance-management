from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class PolicyCreate(BaseModel):
    customer_id: int
    policy_type: str
    policy_number: str
    premium_amount: float
    start_date: date
    end_date: date

class PolicyUpdate(BaseModel):
    policy_type: Optional[str] = None
    premium_amount: Optional[float] = None
    end_date: Optional[date] = None
    status: Optional[str] = None

class PolicyOut(BaseModel):
    id: int
    customer_id: int
    policy_type: str
    policy_number: str
    premium_amount: float
    start_date: date
    end_date: date
    status: str
    created_at: datetime

    class Config:
        from_attributes = True