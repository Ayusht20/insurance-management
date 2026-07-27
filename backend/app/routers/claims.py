from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.claim import Claim
from app.models.policy import Policy
from app.schemas.claim import ClaimCreate, ClaimStatusUpdate, ClaimOut
from app.core.deps import require_role

router = APIRouter(prefix="/claims", tags=["claims"])

@router.post("/", response_model=ClaimOut)
def submit_claim(
    claim_in: ClaimCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin", "agent", "customer")),
):
    policy = db.query(Policy).filter(Policy.id == claim_in.policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    if policy.status != "active":
        raise HTTPException(status_code=400, detail="Cannot claim on an inactive policy")

    claim = Claim(**claim_in.model_dump(), status="pending")
    db.add(claim)
    db.commit()
    db.refresh(claim)
    return claim

@router.get("/", response_model=List[ClaimOut])
def list_claims(
    status: Optional[str] = None,
    policy_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin", "agent", "customer")),
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

    claim.status = status_in.status
    db.commit()
    db.refresh(claim)
    return claim