include ../.env
export
.PHONY: shell build run app tests lint format

SERVICE=backend
UV := $(shell which uv)

shell:
	uv shell

build:
	docker compose build ${SERVICE}

run:
	docker compose up ${SERVICE}

deploy:
	make -C .. backend.deploy

app:
	cd app; uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload

#TODO: use dev container with mounted code instead of env -i prefix
test:
	env -i ${UV} run python -m pytest tests --disable-warnings -vvv --cov=app --cov-report=term-missing tests

testpdb:
	env -i ${UV} run python -m pytest -vvv --pdb

format:
	uv run isort app tests
	uv run black app tests

lint: 
	MYPYPATH=app uv run mypy app

db.check:
	cd app; uv run alembic check

token:
	$(MAKE) -C .. token
