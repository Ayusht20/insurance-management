from sqlalchemy import Column, Integer, Float, String, Date, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base

class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    policy_id = Column(Integer, ForeignKey("policies.id"), nullable=False)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=True)  # NEW
    claim_amount = Column(Float, nullable=False)
    reason = Column(String, nullable=False)
    status = Column(String, default="pending")
    submission_date = Column(Date, server_default=func.current_date())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    policy = relationship("Policy", back_populates="claims")
    document = relationship("Document")
    history = relationship("ClaimHistory", back_populates="claim", order_by="ClaimHistory.changed_at")