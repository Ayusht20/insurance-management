from pydantic import BaseModel
from datetime import datetime

class DocumentOut(BaseModel):
    id: int
    customer_id: int
    file_name: str
    file_path: str
    uploaded_at: datetime

    class Config:
        from_attributes = True