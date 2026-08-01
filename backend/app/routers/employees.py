from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User
from app.schemas.auth import EmployeeCreate, UserOut
from app.core.security import hash_password
from app.core.deps import require_role

router = APIRouter(prefix="/employees", tags=["employees"])

@router.post("/", response_model=UserOut)
def create_employee(
    employee_in: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin")),
):
    if employee_in.role not in ("admin", "agent"):
        raise HTTPException(status_code=400, detail="Role must be 'admin' or 'agent'")

    existing = db.query(User).filter(User.email == employee_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=employee_in.name,
        email=employee_in.email,
        password=hash_password(employee_in.password),
        role=employee_in.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.get("/", response_model=List[UserOut])
def list_employees(
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin")),
):
    return db.query(User).filter(User.role.in_(["admin", "agent"])).all()

@router.delete("/{employee_id}")
def deactivate_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin")),
):
    employee = db.query(User).filter(User.id == employee_id, User.role.in_(["admin", "agent"])).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    if employee.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own account")
    db.delete(employee)
    db.commit()
    return {"detail": "Employee removed"}