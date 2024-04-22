from pydantic import BaseModel


class Attendance(BaseModel):
    day: str
    community: str
    child: str
    cycle: int
    attendance: bool


class Child(BaseModel):
    first_name: str
    last_name: str
    community: str

class Community(BaseModel):
    name: str
