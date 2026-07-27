from pydantic import BaseModel
from typing import List

class PolicyStatusCount(BaseModel):
    status: str
    count: int

class ClaimStatusCount(BaseModel):
    status: str
    count: int

class MonthlyCount(BaseModel):
    month: str  # "2026-01"
    count: int

class MonthlyAmount(BaseModel):
    month: str
    total: float

class DashboardSummary(BaseModel):
    total_customers: int
    total_active_policies: int
    total_expired_policies: int
    total_cancelled_policies: int
    total_pending_claims: int
    total_approved_claims: int
    total_rejected_claims: int
    total_premium_collected: float