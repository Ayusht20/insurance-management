from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base

class Policy(Base):
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    policy_type = Column(String, nullable=False)
    policy_number = Column(String, unique=True, nullable=False, index=True)
    premium_amount = Column(Float, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    status = Column(String, default="active")  # active | expired | cancelled
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    customer = relationship("Customer", back_populates="policies")
    claims = relationship("Claim", back_populates="policy")
    payments = relationship("PremiumPayment", back_populates="policy")