from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from app.database import get_db
from app.models.policy import Policy
from app.models.customer import Customer
from app.schemas.policy import PolicyCreate, PolicyUpdate, PolicyOut
from app.core.deps import require_role

router = APIRouter(prefix="/policies", tags=["policies"])

@router.post("/", response_model=PolicyOut)
def create_policy(
    policy_in: PolicyCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin", "agent")),
):
    customer = db.query(Customer).filter(Customer.id == policy_in.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    existing = db.query(Policy).filter(Policy.policy_number == policy_in.policy_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Policy number already exists")

    policy = Policy(**policy_in.model_dump(), status="active")
    db.add(policy)
    db.commit()
    db.refresh(policy)
    return policy

@router.get("/", response_model=List[PolicyOut])
def list_policies(
    status: Optional[str] = None,
    customer_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin", "agent", "customer")),
):
    query = db.query(Policy)
    if status:
        query = query.filter(Policy.status == status)
    if customer_id:
        query = query.filter(Policy.customer_id == customer_id)
    return query.offset(skip).limit(limit).all()

@router.get("/{policy_id}", response_model=PolicyOut)
def get_policy(
    policy_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin", "agent", "customer")),
):
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    return policy

@router.put("/{policy_id}", response_model=PolicyOut)
def update_policy(
    policy_id: int,
    policy_in: PolicyUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin", "agent")),
):
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")

    update_data = policy_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(policy, field, value)

    db.commit()
    db.refresh(policy)
    return policy

@router.post("/{policy_id}/renew", response_model=PolicyOut)
def renew_policy(
    policy_id: int,
    new_end_date: date,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin", "agent")),
):
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")

    policy.end_date = new_end_date
    policy.status = "active"
    db.commit()
    db.refresh(policy)
    return policy

@router.post("/{policy_id}/cancel", response_model=PolicyOut)
def cancel_policy(
    policy_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin", "agent")),
):
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")

    policy.status = "cancelled"
    db.commit()
    db.refresh(policy)
    return policy

@router.get("/expiring/soon", response_model=List[PolicyOut])
def expiring_policies(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin", "agent")),
):
    from datetime import timedelta
    cutoff = date.today() + timedelta(days=days)
    return (
        db.query(Policy)
        .filter(Policy.status == "active", Policy.end_date <= cutoff)
        .all()
    )

from app.core.deps import get_current_customer
from app.models.insurance_plan import InsurancePlan
import random, string

def generate_policy_number():
    return "POL-" + "".join(random.choices(string.digits, k=8))

@router.post("/apply", response_model=PolicyOut)
def apply_for_policy(
    plan_id: int,
    db: Session = Depends(get_db),
    customer=Depends(get_current_customer),
):
    plan = db.query(InsurancePlan).filter(InsurancePlan.id == plan_id, InsurancePlan.is_active == True).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found or inactive")

    from datetime import date
    from dateutil.relativedelta import relativedelta
    start = date.today()
    end = start + relativedelta(months=plan.duration_months)

    policy = Policy(
        customer_id=customer.id,
        plan_id=plan.id,
        policy_type=plan.plan_type,
        policy_number=generate_policy_number(),
        premium_amount=plan.base_premium,
        start_date=start,
        end_date=end,
        status="active",
    )
    db.add(policy)
    db.commit()
    db.refresh(policy)
    return policy

@router.get("/my", response_model=List[PolicyOut])
def my_policies(
    db: Session = Depends(get_db),
    customer=Depends(get_current_customer),
):
    return db.query(Policy).filter(Policy.customer_id == customer.id).all()