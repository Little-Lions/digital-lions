import pytest
from core.auth import BearerTokenHandlerInst
from core.database.session import get_session
from core.settings import Settings, get_settings
from fastapi.testclient import TestClient
from main import app
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

DefaultTestSettings = Settings(
    POSTGRES_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/digitallions",
    FEATURE_AUTH0=False,
    FEATURE_VERIFY_PERMISSIONS=False,
    AUTH0_SERVER="digitallions.eu.auth0.com",
    AUTH0_AUDIENCE="https://digitallions.eu.auth0.com/api/v2/",
    AUTH0_CLIENT_ID="mock-client-id",
    AUTH0_CLIENT_SECRET="mock-client-secret",
    AUTH0_CONNECTION_ID="mock-connection-id",
    ALLOWED_ORIGINS="http://localhost:8000,http://digitallions.com",
    RESEND_API_KEY="test-resend-api-key",
)


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

    # TODO move this mock user to context for test
    mock_user = mocker.MagicMock(user_id="something")
    app.dependency_overrides[get_settings] = lambda: DefaultTestSettings
    app.dependency_overrides[BearerTokenHandlerInst] = lambda: mock_user
    app.dependency_overrides[get_session] = lambda: session

    client = TestClient(app)
    yield client
