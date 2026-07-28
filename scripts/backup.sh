#!/bin/bash
set -e

# Charger DB_BACKUP_URL depuis .env.local (non commité sur GitHub)
if [ -f ".env.local" ]; then
  DB_URL=$(grep '^DB_BACKUP_URL=' .env.local | cut -d'=' -f2- | tr -d $'\r' | tr -d '"')
fi

if [ -z "$DB_URL" ]; then
  echo "Erreur : DB_BACKUP_URL manquant dans .env.local"
  echo "Ajoute cette ligne dans .env.local :"
  echo "  DB_BACKUP_URL=postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres"
  exit 1
fi

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

echo "Backup en cours..."

# 1. Schéma + données public (tables applicatives)
pg_dump -d "$DB_URL" \
  --schema=public \
  --no-owner \
  --no-acl \
  -f "$BACKUP_DIR/backup_public_$DATE.sql"

# 2. Comptes utilisateurs Auth (emails + mots de passe hashés)
pg_dump -d "$DB_URL" \
  --table=auth.users \
  --table=auth.identities \
  --data-only \
  --no-owner \
  --no-acl \
  -f "$BACKUP_DIR/backup_auth_$DATE.sql"

# Compresser les deux fichiers
gzip "$BACKUP_DIR/backup_public_$DATE.sql"
gzip "$BACKUP_DIR/backup_auth_$DATE.sql"

echo "Backups créés :"
echo "  $BACKUP_DIR/backup_public_${DATE}.sql.gz  (données applicatives)"
echo "  $BACKUP_DIR/backup_auth_${DATE}.sql.gz    (comptes choristes)"

# Supprimer les backups de plus de 30 jours
find "$BACKUP_DIR" -name "*.gz" -mtime +30 -delete
echo "Anciens backups supprimés (>30 jours)"
