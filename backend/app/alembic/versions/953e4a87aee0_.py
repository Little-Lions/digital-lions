"""empty message

Revision ID: 953e4a87aee0
Revises: 168f2f4e6945
Create Date: 2024-06-19 08:59:48.782994

"""

from collections.abc import Sequence
from datetime import datetime

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "953e4a87aee0"
down_revision: str | None = "168f2f4e6945"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "children",
        sa.Column(
            "created_at", sa.DateTime(), nullable=False, server_default=datetime.now()
        ),
    )
    op.add_column(
        "children",
        sa.Column(
            "last_edited", sa.DateTime(), nullable=False, server_default=datetime.now()
        ),
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("children", "last_edited")
    op.drop_column("children", "created_at")
    # ### end Alembic commands ###
