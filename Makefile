include .env
export 
.PHONY: app backend frontend db precommit alembic

backend:
	docker compose up --build backend

frontend:
	docker compose up --build frontend

# deploy to railway dev
frontend.deploy:
	railway up --service frontend-01-dev --detach --environment dev

backend.deploy:
	railway up --service backend-01-dev --detach --environment dev

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
	docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' postgres

key: 
	openssl rand -hex 32
