import pytest
from core.database.session import get_session
from core.settings import Settings, get_settings
from fastapi.testclient import TestClient
from main import app
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

DefaultTestSettings = Settings(
    POSTGRES_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/digitallions",
    FEATURE_OAUTH=False,
    FEATURE_API_KEY=False,
    OAUTH_DOMAIN="https://digitallions.eu.auth0.com",
    OAUTH_AUDIENCE="https://digitallions.eu.auth0.com/api/v2/",
    OAUTH_CLIENT_ID="mock-client-id",
    OAUTH_CLIENT_SECRET="mock-client-secret",
    OAUTH_CONNECTION_ID="mock-connection-id",
    OAUTH_PWD_TICKET_RESULT_URL="http://localhost:8000/ticket_result",
    ALLOWED_ORIGINS="http://localhost:8000,http://digitallions.com",
    API_KEY="test-api-key",
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


@pytest.fixture(autouse=True)
def mock_settings(mocker):
    # TODO: get_settings should be a dependency
    with (
        mocker.patch("core.auth.get_settings", return_value=DefaultTestSettings),
        mocker.patch(
            "core.database.session.get_settings", return_value=DefaultTestSettings
        ),
        mocker.patch("services.user.get_settings", return_value=DefaultTestSettings),
        mocker.patch("services._base.get_settings", return_value=DefaultTestSettings),
        mocker.patch("main.get_settings", return_value=DefaultTestSettings),
    ):
        yield


@pytest.fixture
def client(mocker, session):
    """Create a FastAPI test client."""

    app.dependency_overrides[get_settings] = lambda: DefaultTestSettings

    # overwrite the session dependency with the session fixture
    app.dependency_overrides[get_session] = lambda: session

    client = TestClient(app)
    yield client
