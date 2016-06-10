"""empty message

Revision ID: 3e29a354a008
Revises: c3faad69c152
Create Date: 2016-06-10 07:37:04.738164

"""

# revision identifiers, used by Alembic.
revision = '3e29a354a008'
down_revision = 'c3faad69c152'

from alembic import op
import sqlalchemy as sa


def upgrade():
    op.alter_column('component_update', 'time', existing_type=sa.Integer(), type_=sa.Float(precision=53))
    op.alter_column('component_update', 'lifetime', existing_type=sa.Integer(), type_=sa.Float(precision=53))


def downgrade():
    op.alter_column('component_update', 'time', existing_type=sa.Float(precision=53), type_=sa.Integer())
    op.alter_column('component_update', 'lifetime', existing_type=sa.Float(precision=53), type_=sa.Integer())
