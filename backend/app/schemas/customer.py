from pydantic import BaseModel, EmailStr
from datetime import date, datetime
from typing import Optional

class CustomerCreate(BaseModel):
    name: str
    dob: date
    phone: str
    address: str
    email: EmailStr

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    email: Optional[EmailStr] = None

class CustomerOut(BaseModel):
    id: int
    name: str
    dob: date
    phone: str
    address: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True