include .env
export 
.PHONY: app backend frontend db precommit alembic

app:
	$(MAKE) -C backend app

backend:
	docker compose up --build backend

frontend:
	docker compose up --build frontend

db: 
	docker compose up --build db

db.connect:
	psql -h $(POSTGRES_HOST) -U $(POSTGRES_USER) -d $(POSTGRES_DB)

precommit:
	pre-commit run --all-files

db.check:
	$(MAKE) -C backend db.check

# utility command for wiping the database and its volume
db.wipe:
	docker compose down db
	docker volume rm --force digital-lions_pgdata
	docker compose up db

db.ip: 
	docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' lions-db

key: 
	openssl rand -hex 32

# get OAuth token from auth server 
# usage: make token USERNAME=<email> PASSWORD=<password>
token:
	backend/scripts/token.sh

