import pytest
from core.dependencies import (
    ChildService,
    CommunityService,
    TeamService,
    get_child_service,
    get_community_service,
    get_team_service,
)
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool


@pytest.fixture(name="session")
def session_fixture():
    """Create an in-memory SQLite database for testing."""
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)

    with Session(engine, autocommit=False, autoflush=False) as session:
        yield session


@pytest.fixture
def client(mocker, session):
    """Create a FastAPI test client."""
    # pytest runs from a different path than uvicorn so we need to mock the logger
    # before we import the app otherwise it will break on finding the logging conf
    # TODO setup logging in function + to app.settings
    mocker.patch("logging.config.fileConfig")

    from app.main import app

    def get_community_service_override():
        return CommunityService(session=session)

    def get_child_service_override():
        return ChildService(session=session)

    def get_team_service_override():
        return TeamService(session=session)

    app.dependency_overrides[get_community_service] = get_community_service_override
    app.dependency_overrides[get_child_service] = get_child_service_override
    app.dependency_overrides[get_team_service] = get_team_service_override

    client = TestClient(app)
    yield client
