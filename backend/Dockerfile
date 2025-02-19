FROM python:3.12-slim

RUN apt-get update && apt-get install -y curl && apt-get clean

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

COPY . /app

WORKDIR /app
RUN uv sync --no-dev --frozen

EXPOSE ${PORT}

HEALTHCHECK --interval=30s --timeout=30s \
    CMD curl -f http://localhost:${PORT}/api/v1/health || exit 1

RUN groupadd -r api && useradd --no-log-init -r -g api api
USER api

CMD ["/bin/sh", "/home/run.sh"]
