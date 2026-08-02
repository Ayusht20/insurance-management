import random
import string
from datetime import date, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from dateutil.relativedelta import relativedelta

from app.database import get_db
from app.models.policy import Policy
from app.models.customer import Customer
from app.models.insurance_plan import InsurancePlan
from app.models.document import Document
from app.models.premium_payment import PremiumPayment
from app.schemas.policy import PolicyCreate, PolicyUpdate, PolicyOut, PolicyApplyRequest, OtpVerifyRequest
from app.core.deps import require_role, get_current_customer
from app.core.email import send_otp_email
from app.services.status_sync import sync_policy_statuses

router = APIRouter(prefix="/policies", tags=["policies"])

OTP_RESEND_COOLDOWN_SECONDS = 60


def generate_policy_number():
    return "POL-" + "".join(random.choices(string.digits, k=8))


def generate_otp():
    return "".join(random.choices(string.digits, k=6))


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


# --- Literal-path routes MUST come before /{policy_id} ---

@router.post("/apply", response_model=PolicyOut)
async def apply_for_policy(
    apply_in: PolicyApplyRequest,
    db: Session = Depends(get_db),
    customer=Depends(get_current_customer),
):
    plan = db.query(InsurancePlan).filter(InsurancePlan.id == apply_in.plan_id, InsurancePlan.is_active == True).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found or inactive")

    # NEW: block duplicate applications for the same plan
    existing_policy = (
        db.query(Policy)
        .filter(
            Policy.customer_id == customer.id,
            Policy.plan_id == plan.id,
            Policy.status.in_(["active", "pending_verification"]),
        )
        .first()
    )
    if existing_policy:
        if existing_policy.status == "pending_verification":
            raise HTTPException(
                status_code=400,
                detail=f"You already have a pending application for this plan ({existing_policy.policy_number}) — verify or cancel it first",
            )
        raise HTTPException(
            status_code=400,
            detail=f"You already have an active policy for this plan ({existing_policy.policy_number})",
        )

    if apply_in.installments > plan.installments:
        raise HTTPException(status_code=400, detail=f"This plan allows a maximum of {plan.installments} installments")

    start = date.today()
    end = start + relativedelta(months=plan.duration_months)
    otp = generate_otp()
    now = datetime.utcnow()

    policy = Policy(
        customer_id=customer.id,
        plan_id=plan.id,
        policy_type=plan.plan_type,
        policy_number=generate_policy_number(),
        premium_amount=plan.base_premium,
        start_date=start,
        end_date=end,
        status="pending_verification",
        id_proof_type=apply_in.id_proof_type,
        id_proof_number=apply_in.id_proof_number,
        document_id=apply_in.document_id,
        installments_selected=apply_in.installments,
        otp_code=otp,
        otp_generated_at=now,
        otp_expires_at=now + timedelta(minutes=5),
    )
    db.add(policy)
    db.commit()
    db.refresh(policy)

    await send_otp_email(customer.email, otp, policy.policy_number)
    return policy


@router.post("/{policy_id}/verify-otp", response_model=PolicyOut)
def verify_otp(
    policy_id: int,
    otp_in: OtpVerifyRequest,
    db: Session = Depends(get_db),
    customer=Depends(get_current_customer),
):
    policy = db.query(Policy).filter(Policy.id == policy_id, Policy.customer_id == customer.id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    if policy.status != "pending_verification":
        raise HTTPException(status_code=400, detail="This policy is not awaiting verification")
    if not policy.otp_expires_at or datetime.utcnow() > policy.otp_expires_at.replace(tzinfo=None):
        raise HTTPException(status_code=400, detail="OTP expired — request a new one")
    if otp_in.otp != policy.otp_code:
        raise HTTPException(status_code=400, detail="Incorrect OTP")

    policy.status = "active"
    policy.otp_code = None
    policy.otp_generated_at = None
    policy.otp_expires_at = None
    db.commit()
    db.refresh(policy)

    plan = db.query(InsurancePlan).filter(InsurancePlan.id == policy.plan_id).first()
    installment_count = policy.installments_selected or 1
    installment_amount = round(policy.premium_amount / installment_count, 2)
    months_between = (plan.duration_months // installment_count) if plan else 12 // installment_count

    for i in range(installment_count):
        due_date = policy.start_date + relativedelta(months=months_between * i)
        db.add(PremiumPayment(
            policy_id=policy.id,
            payment_date=due_date,
            amount=installment_amount,
            payment_status="pending",
        ))
    db.commit()

    return policy


@router.post("/{policy_id}/resend-otp")
async def resend_otp(
    policy_id: int,
    db: Session = Depends(get_db),
    customer=Depends(get_current_customer),
):
    policy = db.query(Policy).filter(Policy.id == policy_id, Policy.customer_id == customer.id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    if policy.status != "pending_verification":
        raise HTTPException(status_code=400, detail="This policy is not awaiting verification")

    now = datetime.utcnow()
    if policy.otp_generated_at:
        elapsed = (now - policy.otp_generated_at.replace(tzinfo=None)).total_seconds()
        if elapsed < OTP_RESEND_COOLDOWN_SECONDS:
            wait = int(OTP_RESEND_COOLDOWN_SECONDS - elapsed)
            raise HTTPException(status_code=429, detail=f"Please wait {wait} seconds before requesting a new OTP")

    otp = generate_otp()
    policy.otp_code = otp
    policy.otp_generated_at = now
    policy.otp_expires_at = now + timedelta(minutes=5)
    db.commit()

    await send_otp_email(customer.email, otp, policy.policy_number)
    return {"detail": "OTP resent"}


@router.get("/my", response_model=List[PolicyOut])
def my_policies(
    db: Session = Depends(get_db),
    customer=Depends(get_current_customer),
):
    sync_policy_statuses(db)
    return db.query(Policy).filter(Policy.customer_id == customer.id).all()


@router.get("/expiring/soon", response_model=List[PolicyOut])
def expiring_policies(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin", "agent")),
):
    cutoff = date.today() + timedelta(days=days)
    return (
        db.query(Policy)
        .filter(Policy.status == "active", Policy.end_date <= cutoff)
        .all()
    )


@router.get("/", response_model=List[PolicyOut])
def list_policies(
    status: Optional[str] = None,
    customer_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin", "agent", "customer")),
):
    sync_policy_statuses(db)
    query = db.query(Policy)
    if status:
        query = query.filter(Policy.status == status)
    if customer_id:
        query = query.filter(Policy.customer_id == customer_id)
    return query.offset(skip).limit(limit).all()


# --- Parameterized route MUST come after all literal ones above ---

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

@router.delete("/{policy_id}/cancel-application")
def cancel_pending_application(
    policy_id: int,
    db: Session = Depends(get_db),
    customer=Depends(get_current_customer),
):
    policy = db.query(Policy).filter(Policy.id == policy_id, Policy.customer_id == customer.id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    if policy.status != "pending_verification":
        raise HTTPException(status_code=400, detail="Only unverified applications can be cancelled this way")

    db.delete(policy)
    db.commit()
    return {"detail": "Application cancelled"}