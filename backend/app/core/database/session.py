from functools import lru_cache
from typing import Annotated

from fastapi import Depends
from sqlmodel import Session, SQLModel, create_engine

from core.settings import get_settings


@lru_cache
def get_engine():
    """Get a cached database engine."""
    settings = get_settings()
    return create_engine(settings.POSTGRES_DATABASE_URL)


def init_db():
    """Setup DB and add super users to it."""
    engine = get_engine()
    SQLModel.metadata.create_all(engine)


def get_session() -> Session:
    """Get a database session.

    Args:
        engine: SQLModel engine."""
    engine = get_engine()
    with Session(bind=engine, autocommit=False, autoflush=False) as session:
        yield session


SessionDependency = Annotated[Session, Depends(get_session)]
