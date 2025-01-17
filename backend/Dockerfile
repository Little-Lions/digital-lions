FROM python:3.11.5-slim

ARG POETRY_VERSION=1.8.2

WORKDIR /home

COPY pyproject.toml poetry.lock /home/

RUN pip3 install poetry==$POETRY_VERSION
RUN poetry config virtualenvs.create false \
    && poetry install --without dev --no-root --no-interaction

COPY . /home/

EXPOSE $PORT

RUN groupadd -r api && useradd --no-log-init -r -g api api

USER api

CMD ["/bin/sh", "/home/run.sh"]
