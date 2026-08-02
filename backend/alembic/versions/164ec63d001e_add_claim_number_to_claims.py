"""add claim_number to claims

Revision ID: 164ec63d001e
Revises: 1a423cde46cc
Create Date: 2026-08-01 18:01:20.397422

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '164ec63d001e'
down_revision: Union[str, Sequence[str], None] = '1a423cde46cc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('claims', sa.Column('claim_number', sa.String(), nullable=True))
    op.execute("UPDATE claims SET claim_number = 'CLM-' || LPAD(id::text, 8, '0') WHERE claim_number IS NULL")
    op.alter_column('claims', 'claim_number', nullable=False)
    op.create_index(op.f('ix_claims_claim_number'), 'claims', ['claim_number'], unique=True)

def downgrade() -> None:
    op.drop_index(op.f('ix_claims_claim_number'), table_name='claims')
    op.drop_column('claims', 'claim_number')
