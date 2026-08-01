from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base

class ClaimHistory(Base):
    __tablename__ = "claim_history"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey("claims.id"), nullable=False)
    status = Column(String, nullable=False)
    changed_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    changed_by_name = Column(String, nullable=True)  # denormalized so history reads fine even if the user is later deleted
    note = Column(String, nullable=True)
    changed_at = Column(DateTime(timezone=True), server_default=func.now())

    claim = relationship("Claim", back_populates="history")