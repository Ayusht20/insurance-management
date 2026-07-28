from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.insurance_plan import InsurancePlan
from app.schemas.insurance_plan import PlanCreate, PlanUpdate, PlanOut
from app.core.deps import require_role, get_current_user

router = APIRouter(prefix="/plans", tags=["plans"])

# Anyone logged in can browse active plans (customers need this to choose)
@router.get("/", response_model=List[PlanOut])
def list_plans(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return db.query(InsurancePlan).filter(InsurancePlan.is_active == True).all()

@router.get("/{plan_id}", response_model=PlanOut)
def get_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    plan = db.query(InsurancePlan).filter(InsurancePlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan

# Only admin manages the catalog
@router.post("/", response_model=PlanOut)
def create_plan(
    plan_in: PlanCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin")),
):
    plan = InsurancePlan(**plan_in.model_dump())
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan

@router.put("/{plan_id}", response_model=PlanOut)
def update_plan(
    plan_id: int,
    plan_in: PlanUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin")),
):
    plan = db.query(InsurancePlan).filter(InsurancePlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    for field, value in plan_in.model_dump(exclude_unset=True).items():
        setattr(plan, field, value)
    db.commit()
    db.refresh(plan)
    return plan