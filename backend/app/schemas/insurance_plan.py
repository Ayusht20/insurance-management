from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class PlanCreate(BaseModel):
    name: str
    plan_type: str
    description: Optional[str] = None
    coverage_amount: float
    base_premium: float
    duration_months: int = 12
    installments: int = 1

class PlanUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    coverage_amount: Optional[float] = None
    base_premium: Optional[float] = None
    installments: Optional[int] = None
    is_active: Optional[bool] = None

class PlanOut(BaseModel):
    id: int
    name: str
    plan_type: str
    description: Optional[str]
    coverage_amount: float
    base_premium: float
    duration_months: int
    installments: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True