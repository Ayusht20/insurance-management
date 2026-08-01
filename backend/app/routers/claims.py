import random
import string
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional

from app.database import get_db
from app.models.claim import Claim
from app.models.claim_history import ClaimHistory
from app.models.policy import Policy
from app.models.document import Document
from app.schemas.claim import ClaimCreate, ClaimStatusUpdate, ClaimOut, ClaimHistoryOut
from app.core.deps import require_role, get_current_customer, get_current_user

router = APIRouter(prefix="/claims", tags=["claims"])


def generate_claim_number():
    return "CLM-" + "".join(random.choices(string.digits, k=8))


def log_history(db: Session, claim_id: int, status: str, user, note: Optional[str] = None):
    entry = ClaimHistory(
        claim_id=claim_id,
        status=status,
        changed_by_user_id=getattr(user, "id", None),
        changed_by_name=getattr(user, "name", "System"),
        note=note,
    )
    db.add(entry)
    db.commit()


@router.post("/", response_model=ClaimOut)
def submit_claim(
    claim_in: ClaimCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    policy = db.query(Policy).filter(Policy.id == claim_in.policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    if policy.status != "active":
        raise HTTPException(status_code=400, detail="Cannot claim on an inactive policy")
    if not policy.plan:
        raise HTTPException(status_code=400, detail="Policy has no linked plan; cannot validate coverage")

    document = db.query(Document).filter(Document.id == claim_in.document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Supporting document not found")
    if document.customer_id != policy.customer_id:
        raise HTTPException(status_code=403, detail="Document does not belong to this policy's customer")

    coverage_limit = policy.plan.coverage_amount
    already_approved = (
        db.query(func.coalesce(func.sum(Claim.claim_amount), 0.0))
        .filter(Claim.policy_id == policy.id, Claim.status == "approved")
        .scalar()
    )
    remaining_coverage = coverage_limit - already_approved

    if claim_in.claim_amount > coverage_limit:
        raise HTTPException(status_code=400, detail=f"Claim amount exceeds total coverage of ₹{coverage_limit}")
    if claim_in.claim_amount > remaining_coverage:
        raise HTTPException(status_code=400, detail=f"Claim amount exceeds remaining coverage of ₹{remaining_coverage}")

    claim = Claim(
        claim_number=generate_claim_number(),
        policy_id=claim_in.policy_id,
        document_id=claim_in.document_id,
        claim_amount=claim_in.claim_amount,
        reason=claim_in.reason,
        status="pending",
    )
    db.add(claim)
    db.commit()
    db.refresh(claim)

    log_history(db, claim.id, "pending", current_user, note="Claim submitted")
    return claim


@router.get("/coverage-remaining/{policy_id}")
def get_remaining_coverage(
    policy_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin", "agent", "customer")),
):
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy or not policy.plan:
        raise HTTPException(status_code=404, detail="Policy or linked plan not found")

    already_approved = (
        db.query(func.coalesce(func.sum(Claim.claim_amount), 0.0))
        .filter(Claim.policy_id == policy.id, Claim.status == "approved")
        .scalar()
    )
    return {
        "coverage_amount": policy.plan.coverage_amount,
        "already_claimed": already_approved,
        "remaining_coverage": policy.plan.coverage_amount - already_approved,
    }


@router.get("/my", response_model=List[ClaimOut])
def my_claims(
    db: Session = Depends(get_db),
    customer=Depends(get_current_customer),
):
    policy_ids = [p.id for p in customer.policies]
    return db.query(Claim).filter(Claim.policy_id.in_(policy_ids)).all()


@router.get("/", response_model=List[ClaimOut])
def list_claims(
    status: Optional[str] = None,
    policy_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin", "agent")),
):
    query = db.query(Claim)
    if status:
        query = query.filter(Claim.status == status)
    if policy_id:
        query = query.filter(Claim.policy_id == policy_id)
    return query.all()


@router.get("/{claim_id}", response_model=ClaimOut)
def get_claim(
    claim_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin", "agent", "customer")),
):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return claim


@router.get("/{claim_id}/history", response_model=List[ClaimHistoryOut])
def get_claim_history(
    claim_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin", "agent", "customer")),
):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return claim.history


@router.put("/{claim_id}/review", response_model=ClaimOut)
def review_claim(
    claim_id: int,
    status_in: ClaimStatusUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin", "agent")),
):
    if status_in.status not in ("approved", "rejected"):
        raise HTTPException(status_code=400, detail="Status must be 'approved' or 'rejected'")

    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    if claim.status != "pending":
        raise HTTPException(status_code=400, detail="Only pending claims can be reviewed")

    claim.status = status_in.status
    db.commit()
    db.refresh(claim)

    log_history(db, claim.id, status_in.status, current_user, note=status_in.note)
    return claim