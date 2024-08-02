"""On delete child cascade attendance

Revision ID: 033ac48b6ad3
Revises: 4c79ea1779c6
Create Date: 2024-08-02 14:54:03.569340

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '033ac48b6ad3'
down_revision: Union[str, None] = '4c79ea1779c6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('attendances', 'child_id',
               existing_type=sa.INTEGER(),
               nullable=True)
    op.drop_constraint('attendances_child_id_fkey', 'attendances', type_='foreignkey')
    op.create_foreign_key(None, 'attendances', 'children', ['child_id'], ['id'], ondelete='CASCADE')
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'attendances', type_='foreignkey')
    op.create_foreign_key('attendances_child_id_fkey', 'attendances', 'children', ['child_id'], ['id'])
    op.alter_column('attendances', 'child_id',
               existing_type=sa.INTEGER(),
               nullable=False)
    # ### end Alembic commands ###
