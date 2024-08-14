#!/bin/bash
123
set -e;
if [ -n "${DATABASE_USERNAME:-}" ] && [ -n "${DATABASE_PASSWORD:-}" ]; then
	psql -v ON_ERROR_STOP=1 --username "$DATABASE_USERNAME"  <<-EOSQL
		CREATE DATABASE ${DATABASE_NAME};
		GRANT ALL PRIVILEGES ON DATABASE ${DATABASE_NAME} TO ${DB_USERNAME};
	EOSQL
else
	echo "SETUP INFO: No Environment variables given!"
fi
