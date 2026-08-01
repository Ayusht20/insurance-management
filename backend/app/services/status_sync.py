from datetime import date
from sqlalchemy.orm import Session

from app.models.policy import Policy
from app.models.premium_payment import PremiumPayment


def sync_policy_statuses(db: Session):
    """Any active policy past its end_date is now expired."""
    today = date.today()
    expired = db.query(Policy).filter(Policy.status == "active", Policy.end_date < today).all()
    for policy in expired:
        policy.status = "expired"
    if expired:
        db.commit()
    return len(expired)


def sync_premium_statuses(db: Session):
    """Any pending payment whose due date has passed is now overdue."""
    today = date.today()
    overdue = db.query(PremiumPayment).filter(
        PremiumPayment.payment_status == "pending", PremiumPayment.payment_date < today
    ).all()
    for payment in overdue:
        payment.payment_status = "overdue"
    if overdue:
        db.commit()
    return len(overdue)