from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from app.database import get_db
from app.models.premium_payment import PremiumPayment
from app.models.policy import Policy
from app.schemas.premium import PremiumCreate, PremiumUpdate, PremiumOut
from app.core.deps import require_role

router = APIRouter(prefix="/premiums", tags=["premiums"])

@router.post("/", response_model=PremiumOut)
def record_payment(
    payment_in: PremiumCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin", "agent", "customer")),
):
    policy = db.query(Policy).filter(Policy.id == payment_in.policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")

    payment = PremiumPayment(**payment_in.model_dump(), payment_status="paid")
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment

@router.get("/", response_model=List[PremiumOut])
def list_payments(
    policy_id: Optional[int] = None,
    payment_status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin", "agent", "customer")),
):
    query = db.query(PremiumPayment)
    if policy_id:
        query = query.filter(PremiumPayment.policy_id == policy_id)
    if payment_status:
        query = query.filter(PremiumPayment.payment_status == payment_status)
    return query.all()

@router.put("/{payment_id}", response_model=PremiumOut)
def update_payment_status(
    payment_id: int,
    payment_in: PremiumUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin", "agent")),
):
    payment = db.query(PremiumPayment).filter(PremiumPayment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    payment.payment_status = payment_in.payment_status
    db.commit()
    db.refresh(payment)
    return payment

@router.get("/overdue/list", response_model=List[PremiumOut])
def overdue_payments(
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin", "agent")),
):
    today = date.today()
    return (
        db.query(PremiumPayment)
        .filter(PremiumPayment.payment_status != "paid", PremiumPayment.payment_date < today)
        .all()
    )

from app.core.deps import get_current_customer

@router.get("/my", response_model=List[PremiumOut])
def my_payments(
    db: Session = Depends(get_db),
    customer=Depends(get_current_customer),
):
    policy_ids = [p.id for p in customer.policies]
    return db.query(PremiumPayment).filter(PremiumPayment.policy_id.in_(policy_ids)).all()