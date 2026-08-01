from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List

from app.database import get_db
from app.models.customer import Customer
from app.models.policy import Policy
from app.models.claim import Claim
from app.models.premium_payment import PremiumPayment
from app.schemas.report import (
    PolicyStatusCount, ClaimStatusCount, MonthlyCount, MonthlyAmount, DashboardSummary
)
from app.core.deps import require_role

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/summary", response_model=DashboardSummary)
def dashboard_summary(
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin", "agent")),
):
    total_customers = db.query(func.count(Customer.id)).scalar()

    active = db.query(func.count(Policy.id)).filter(Policy.status == "active").scalar()
    expired = db.query(func.count(Policy.id)).filter(Policy.status == "expired").scalar()
    cancelled = db.query(func.count(Policy.id)).filter(Policy.status == "cancelled").scalar()

    pending_claims = db.query(func.count(Claim.id)).filter(Claim.status == "pending").scalar()
    approved_claims = db.query(func.count(Claim.id)).filter(Claim.status == "approved").scalar()
    rejected_claims = db.query(func.count(Claim.id)).filter(Claim.status == "rejected").scalar()

    total_premium = db.query(func.coalesce(func.sum(PremiumPayment.amount), 0.0)).filter(
        PremiumPayment.payment_status == "paid"
    ).scalar()

    return DashboardSummary(
        total_customers=total_customers,
        total_active_policies=active,
        total_expired_policies=expired,
        total_cancelled_policies=cancelled,
        total_pending_claims=pending_claims,
        total_approved_claims=approved_claims,
        total_rejected_claims=rejected_claims,
        total_premium_collected=float(total_premium),
    )

@router.get("/policies/by-status", response_model=List[PolicyStatusCount])
def policies_by_status(
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin", "agent")),
):
    rows = (
        db.query(Policy.status, func.count(Policy.id))
        .group_by(Policy.status)
        .all()
    )
    return [PolicyStatusCount(status=r[0], count=r[1]) for r in rows]

@router.get("/claims/by-status", response_model=List[ClaimStatusCount])
def claims_by_status(
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin", "agent")),
):
    rows = (
        db.query(Claim.status, func.count(Claim.id))
        .group_by(Claim.status)
        .all()
    )
    return [ClaimStatusCount(status=r[0], count=r[1]) for r in rows]

@router.get("/customers/growth", response_model=List[MonthlyCount])
def customer_growth(
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin", "agent")),
):
    rows = (
        db.query(
            func.to_char(Customer.created_at, "YYYY-MM").label("month"),
            func.count(Customer.id),
        )
        .group_by("month")
        .order_by("month")
        .all()
    )
    return [MonthlyCount(month=r[0], count=r[1]) for r in rows]

@router.get("/premiums/monthly-collection", response_model=List[MonthlyAmount])
def monthly_premium_collection(
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin", "agent")),
):
    rows = (
        db.query(
            func.to_char(PremiumPayment.payment_date, "YYYY-MM").label("month"),
            func.coalesce(func.sum(PremiumPayment.amount), 0.0),
        )
        .filter(PremiumPayment.payment_status == "paid")
        .group_by("month")
        .order_by("month")
        .all()
    )
    return [MonthlyAmount(month=r[0], total=float(r[1])) for r in rows]

from app.core.email import send_email
from app.models.policy import Policy
from app.models.premium_payment import PremiumPayment
from datetime import date, timedelta

@router.post("/notify/expiring-policies")
async def notify_expiring_policies(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin", "agent")),
):
    cutoff = date.today() + timedelta(days=days)
    expiring = db.query(Policy).filter(Policy.status == "active", Policy.end_date <= cutoff).all()

    sent = 0
    for policy in expiring:
        customer = policy.customer
        await send_email(
            subject="Your Insurance Policy is Expiring Soon",
            recipients=[customer.email],
            body=f"<p>Hi {customer.name},</p><p>Your policy <b>{policy.policy_number}</b> expires on {policy.end_date}. Please renew soon to avoid a coverage gap.</p>",
        )
        sent += 1
    return {"notified": sent}

@router.post("/notify/overdue-premiums")
async def notify_overdue_premiums(
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin", "agent")),
):
    today = date.today()
    overdue = db.query(PremiumPayment).filter(
        PremiumPayment.payment_status != "paid", PremiumPayment.payment_date < today
    ).all()

    sent = 0
    for payment in overdue:
        customer = payment.policy.customer
        await send_email(
            subject="Premium Payment Overdue",
            recipients=[customer.email],
            body=f"<p>Hi {customer.name},</p><p>Your premium payment of ₹{payment.amount} for policy <b>{payment.policy.policy_number}</b> was due on {payment.payment_date} and is still pending.</p>",
        )
        sent += 1
    return {"notified": sent}