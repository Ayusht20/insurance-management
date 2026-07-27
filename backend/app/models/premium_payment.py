from sqlalchemy import Column, Integer, Float, String, Date, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base

class PremiumPayment(Base):
    __tablename__ = "premium_payments"

    id = Column(Integer, primary_key=True, index=True)
    policy_id = Column(Integer, ForeignKey("policies.id"), nullable=False)
    payment_date = Column(Date, nullable=False)
    amount = Column(Float, nullable=False)
    payment_status = Column(String, default="pending")  # pending | paid | overdue
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    policy = relationship("Policy", back_populates="payments")