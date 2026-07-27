from sqlalchemy import Column, Integer, String, Date, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    dob = Column(Date, nullable=False)
    phone = Column(String, nullable=False)
    address = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    policies = relationship("Policy", back_populates="customer")
    documents = relationship("Document", back_populates="customer")