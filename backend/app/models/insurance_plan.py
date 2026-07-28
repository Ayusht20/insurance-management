from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base

class InsurancePlan(Base):
    __tablename__ = "insurance_plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)           # "Health Shield Basic"
    plan_type = Column(String, nullable=False)       # "health" | "life" | "vehicle"
    description = Column(String, nullable=True)
    coverage_amount = Column(Float, nullable=False)
    base_premium = Column(Float, nullable=False)     # per year
    duration_months = Column(Integer, nullable=False, default=12)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    policies = relationship("Policy", back_populates="plan")