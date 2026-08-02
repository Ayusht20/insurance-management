from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base

class Policy(Base):
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    plan_id = Column(Integer, ForeignKey("insurance_plans.id"), nullable=True)
    policy_type = Column(String, nullable=False)
    policy_number = Column(String, unique=True, nullable=False, index=True)
    premium_amount = Column(Float, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    status = Column(String, default="active")  # active | pending_verification | expired | cancelled

    id_proof_type = Column(String, nullable=True)      # "aadhaar" | "pan" | "passport" | "driving_license"
    id_proof_number = Column(String, nullable=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=True)
    installments_selected = Column(Integer, nullable=True)

    otp_code = Column(String, nullable=True)
    otp_generated_at = Column(DateTime(timezone=True), nullable=True)
    otp_expires_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    customer = relationship("Customer", back_populates="policies")
    plan = relationship("InsurancePlan", back_populates="policies")
    document = relationship("Document")
    claims = relationship("Claim", back_populates="policy")
    payments = relationship("PremiumPayment", back_populates="policy")