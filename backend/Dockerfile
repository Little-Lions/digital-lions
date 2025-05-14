FROM python:3.11.5-slim

ARG POETRY_VERSION=2.1.2

WORKDIR /home

COPY pyproject.toml poetry.lock /home/

RUN pip3 install poetry==${POETRY_VERSION}
RUN poetry config virtualenvs.create false \
  && poetry install --without dev --no-root --no-interaction

COPY . /home/

RUN apt-get update && apt-get install -y curl && apt-get clean

EXPOSE ${PORT}

HEALTHCHECK --interval=30s --timeout=30s \
  CMD curl -f http://localhost:${PORT}/api/v1/health || exit 1

RUN groupadd -r api && useradd --no-log-init -r -g api api
USER api

CMD ["/bin/sh", "/home/run.sh"]
