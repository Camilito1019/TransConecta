#!/bin/sh
set -eu

DUMP_PATH="/backups/dump-transconecta-202512121417.sql"

if [ ! -f "$DUMP_PATH" ]; then
  echo "[init] No se encontró el dump en $DUMP_PATH; se omite restauración."
  exit 0
fi

echo "[init] Restaurando dump PGDMP desde $DUMP_PATH en la BD $POSTGRES_DB..."

# Restauración en base vacía. Flags para evitar problemas de owners/privilegios.
pg_restore \
  -U "$POSTGRES_USER" \
  -d "$POSTGRES_DB" \
  --no-owner \
  --no-privileges \
  --clean \
  --if-exists \
  "$DUMP_PATH"

echo "[init] Restauración completada."
