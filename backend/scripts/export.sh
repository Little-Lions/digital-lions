#!/bin/bash
# utility script to export all tables from database to csv's

# Tables to exclude (separate with spaces)
EXCLUDE_TABLES="alembic_version roles"

echo "DATABASE_CONNECTION_STRING: ${DATABASE_CONNECTION_STRING}"

mkdir -p db/exports

# Get all table names
tables=$(psql "$DATABASE_CONNECTION_STRING" -t -c "\dt" | cut -d'|' -f2 | tr -d ' ')

# Export each table to a CSV file, excluding specified tables
for table in $tables; do
  # Check if the table should be excluded
  if [[ ! " $EXCLUDE_TABLES " =~ " $table " ]]; then
    echo "Exporting $table..."
    psql "$DATABASE_CONNECTION_STRING" -c "\COPY $table TO 'db/exports/$table.csv' WITH CSV HEADER"
  else
    echo "Skipping excluded table: $table"
  fi
done

# Zip all CSV files
zip -r database_export.zip db/exports/
