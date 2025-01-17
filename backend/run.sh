#!/bin/sh
set -e

echo "Waiting 3 seconds for Railway private url to init"
sleep 3

echo "Running migrations"
alembic --raiseerr upgrade head

echo "Starting backend"
cd app
uvicorn main:app --proxy-headers --host 0.0.0.0 --port ${PORT}
