"""Stage 31 Auth & Profiles Schema Migration.

Revision ID: 022_stage_31_auth_profiles
Revises: 021_stage_30_supabase
Create Date: 2026-09-12 16:35:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '022_stage_31_auth_profiles'
down_revision = '021_stage_30_supabase'
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    # 1. Create public.profiles table if not exists
    if not inspector.has_table('profiles'):
        op.create_table(
            'profiles',
            sa.Column('id', sa.String(length=36), primary_key=True),
            sa.Column('auth_user_id', sa.String(length=36), nullable=True, index=True),
            sa.Column('full_name', sa.String(length=100), nullable=False),
            sa.Column('avatar_url', sa.String(length=255), nullable=True),
            sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
            sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'))
        )

    # 2. Add auth_user_id and profile_id columns to public.users table if missing
    existing_user_cols = [c['name'] for c in inspector.get_columns('users')]
    if 'auth_user_id' not in existing_user_cols:
        op.add_column('users', sa.Column('auth_user_id', sa.String(length=36), nullable=True))
        op.create_index('idx_users_auth_user_id', 'users', ['auth_user_id'])

    if 'profile_id' not in existing_user_cols:
        op.add_column('users', sa.Column('profile_id', sa.String(length=36), nullable=True))
        if bind.dialect.name == 'postgresql':
            op.create_foreign_key('fk_users_profile_id', 'users', 'profiles', ['profile_id'], ['id'], ondelete='SET NULL')


def downgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    existing_user_cols = [c['name'] for c in inspector.get_columns('users')]
    if 'profile_id' in existing_user_cols:
        if bind.dialect.name == 'postgresql':
            op.drop_constraint('fk_users_profile_id', 'users', type_='foreignkey')
        op.drop_column('users', 'profile_id')

    if 'auth_user_id' in existing_user_cols:
        op.drop_index('idx_users_auth_user_id', table_name='users')
        op.drop_column('users', 'auth_user_id')

    if inspector.has_table('profiles'):
        op.drop_table('profiles')
