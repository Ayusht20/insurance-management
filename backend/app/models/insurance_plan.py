from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base

class InsurancePlan(Base):
    __tablename__ = "insurance_plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    plan_type = Column(String, nullable=False)
    description = Column(String, nullable=True)
    coverage_amount = Column(Float, nullable=False)
    base_premium = Column(Float, nullable=False)
    duration_months = Column(Integer, nullable=False, default=12)
    installments = Column(Integer, nullable=False, default=1)  # NEW: 1=lump sum, 4=quarterly, 12=monthly
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    policies = relationship("Policy", back_populates="plan")