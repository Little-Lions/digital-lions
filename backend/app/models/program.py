from sqlmodel import Field, SQLModel


class Program(SQLModel, table=False):
    """Data model for workshop programs. A program is a set of workshops that a team
    follows. It is used to track the progress of a team through the workshops. The table's
    ID column (PK) is an indicator (FK on Team's table) of where a team is in the program.

    Example:
        With program_id 1, workshop 0, the Team has not started the pgram yet.
        With program_id 1, workshop 1, the Team has completed workshop 1.
    """

    __tablename__ = "programs"

    id: int = Field(default=None, primary_key=True)
    program_id: int = Field()
    workshop: int = Field()
    workshop_name: str = Field(default=None)


# for V1 there will not be a program table in the databse, instead
# we just hardcode a default program of 12 workshops
DefaultProgram = [
    Program(id=n, program_id=1, workshop=n, workshop_name=f"Workshop {n}") for n in range(1, 13)
]
