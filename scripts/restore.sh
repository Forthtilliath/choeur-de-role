#!/bin/bash
set -e

# Charger DB_BACKUP_URL depuis .env.local (non commité sur GitHub)
if [ -f ".env.local" ]; then
  DB_URL=$(grep '^DB_BACKUP_URL=' .env.local | cut -d'=' -f2- | tr -d $'\r' | tr -d '"')
fi

if [ -z "$DB_URL" ]; then
  echo "Erreur : DB_BACKUP_URL manquant dans .env.local"
  exit 1
fi

# Usage : ./scripts/restore.sh 20260609_003723
DATE_SUFFIX="${1:?Usage: ./scripts/restore.sh YYYYMMDD_HHMMSS}"
BACKUP_DIR="./backups"

PUBLIC_FILE="$BACKUP_DIR/backup_public_${DATE_SUFFIX}.sql"
AUTH_FILE="$BACKUP_DIR/backup_auth_${DATE_SUFFIX}.sql"

# Décompresser si nécessaire
[ -f "${PUBLIC_FILE}.gz" ] && gunzip -k "${PUBLIC_FILE}.gz"
[ -f "${AUTH_FILE}.gz" ]   && gunzip -k "${AUTH_FILE}.gz"

if [ ! -f "$PUBLIC_FILE" ]; then
  echo "Fichier introuvable : $PUBLIC_FILE"
  exit 1
fi

echo "Restauration des données applicatives (public)..."
psql -d "$DB_URL" \
  --single-transaction \
  -f "$PUBLIC_FILE"

if [ -f "$AUTH_FILE" ]; then
  echo "Restauration des comptes choristes (auth)..."
  psql -d "$DB_URL" \
    --single-transaction \
    -f "$AUTH_FILE"
fi

echo "Restauration terminée."
