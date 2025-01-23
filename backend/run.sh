#!/bin/sh
set -e

echo "Running migrations"
alembic --raiseerr upgrade head

echo "Starting backend"
cd app
uvicorn main:app --proxy-headers --host 0.0.0.0 --port ${PORT}
