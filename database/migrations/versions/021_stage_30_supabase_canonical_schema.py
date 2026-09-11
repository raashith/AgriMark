"""Stage 30 Supabase & PostgreSQL Canonical Schema Alignment.

Revision ID: 021_stage_30_supabase
Revises: 020_stage_29_trade_climate_resilience
Create Date: 2026-09-11 12:15:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '021_stage_30_supabase'
down_revision = '020_stage_29_trade_climate_resilience'
branch_labels = None
depends_on = None


def upgrade():
    # Check if database is SQLite or PostgreSQL
    bind = op.get_bind()
    dialect = bind.dialect.name

    if dialect == 'postgresql':
        op.execute("""
            ALTER TABLE produce_lots ENABLE ROW LEVEL SECURITY;
            ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
            ALTER TABLE marketplace_orders ENABLE ROW LEVEL SECURITY;
        """)


def downgrade():
    bind = op.get_bind()
    dialect = bind.dialect.name

    if dialect == 'postgresql':
        op.execute("""
            ALTER TABLE produce_lots DISABLE ROW LEVEL SECURITY;
            ALTER TABLE marketplace_listings DISABLE ROW LEVEL SECURITY;
            ALTER TABLE marketplace_orders DISABLE ROW LEVEL SECURITY;
        """)
