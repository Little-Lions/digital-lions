include ../.env
export
.PHONY: shell build run app tests lint format 

SERVICE=backend
POETRY := $(shell which poetry)

install:
	poetry install

app:
	cd app; poetry run uvicorn main:app --host 0.0.0.0 --port 8000 --reload

build:
	docker compose build ${SERVICE}

run:
	docker compose up ${SERVICE}

#TODO: use devcontainers with mounted code instead of env -i prefix
test:
	env -i $(POETRY) run python -m pytest tests --disable-warnings -vvv --cov=app --cov-report=term-missing tests

testpdb:
	env -i $(POETRY) run python -m pytest -vvv --pdb

lint: format
	poetry run ruff check app tests

format:
	poetry run isort app tests
	poetry run black app tests

db.check:
	cd app; poetry run alembic check

token:
	$(MAKE) -C .. token

token.copy:
	$(MAKE) -C .. token.copy

# wipe local database via API script
scripts.wipe:
	poetry run python scripts/utils.py wipe

scripts.populate:
	cd scripts; poetry run python utils.py populate
