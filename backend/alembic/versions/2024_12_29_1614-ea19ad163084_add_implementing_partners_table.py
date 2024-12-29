"""Add Implementing Partners table

Revision ID: ea19ad163084
Revises: ecd236638299
Create Date: 2024-12-29 16:14:47.628740

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel

from core.database.schema import ImplementingPartner


# revision identifiers, used by Alembic.
revision: str = "ea19ad163084"
down_revision: Union[str, None] = "ecd236638299"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create the "implementing_partners" table
    op.create_table(
        "implementing_partners",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, default=True),
        sa.Column(
            "created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()
        ),
        sa.Column(
            "last_updated_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    # Add "implementing_partner_id" column to "communities"
    op.add_column(
        "communities",
        sa.Column("implementing_partner_id", sa.Integer(), nullable=True),
    )

    # Insert default record into "implementing_partners"
    bind = op.get_bind()
    session = sa.orm.Session(bind=bind)
    little_lions = ImplementingPartner(
        name="Little Lions",
        is_active=True,
        created_at=sa.func.now(),
        last_updated_at=sa.func.now(),
    )
    session.add(little_lions)
    session.commit()

    # Update existing communities to link to the default implementing partner
    session.execute(
        sa.text(
            """
            UPDATE communities
            SET implementing_partner_id = :implementing_partner_id
            """
        ),
        {"implementing_partner_id": little_lions.id},
    )
    session.commit()

    # Add foreign key constraint
    op.create_foreign_key(
        "fk_communities_implementing_partner",
        "communities",
        "implementing_partners",
        ["implementing_partner_id"],
        ["id"],
        ondelete="CASCADE",
    )


def downgrade() -> None:
    # Drop foreign key
    op.drop_constraint(
        "fk_communities_implementing_partner", "communities", type_="foreignkey"
    )

    # Remove "implementing_partner_id" column from "communities"
    op.drop_column("communities", "implementing_partner_id")

    # Drop "implementing_partners" table
    op.drop_table("implementing_partners")
