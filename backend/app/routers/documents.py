import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.document import Document
from app.models.customer import Customer
from app.schemas.document import DocumentOut
from app.core.deps import require_role

router = APIRouter(prefix="/documents", tags=["documents"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/{customer_id}", response_model=DocumentOut)
def upload_document(
    customer_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin", "agent", "customer")),
):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    safe_name = f"{customer_id}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, safe_name)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    document = Document(customer_id=customer_id, file_name=file.filename, file_path=file_path)
    db.add(document)
    db.commit()
    db.refresh(document)
    return document

@router.get("/customer/{customer_id}", response_model=List[DocumentOut])
def list_customer_documents(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin", "agent", "customer")),
):
    return db.query(Document).filter(Document.customer_id == customer_id).all()

@router.get("/{document_id}/download")
def download_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin", "agent", "customer")),
):
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document or not os.path.exists(document.file_path):
        raise HTTPException(status_code=404, detail="Document not found")
    return FileResponse(document.file_path, filename=document.file_name)