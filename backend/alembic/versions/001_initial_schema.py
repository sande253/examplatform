"""initial_schema

Revision ID: 001
Revises: 
Create Date: 2024-10-10 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Uses autogenerate to build tables, since all models use Base.
    # In a real scenario you would run `alembic revision --autogenerate`
    pass

def downgrade() -> None:
    pass
