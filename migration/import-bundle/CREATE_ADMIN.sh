#!/usr/bin/env bash
# Create or reset an admin user directly in the VPS Postgres database.
#
# Usage:
#   ./CREATE_ADMIN.sh <email> <password>
#
# Example:
#   ./CREATE_ADMIN.sh digiwebdex@gmail.com 'MyStr0ngPass!'
#
# This script:
#   1. Hashes the password with bcryptjs (cost 12) — matches backend/src/routes/auth.js
#   2. Upserts the row in `users` (email_verified=true, is_active=true)
#   3. Ensures a matching `profiles` row exists
#   4. Ensures the user has the 'admin' role in `user_roles`

set -euo pipefail

EMAIL="${1:-}"
PASSWORD="${2:-}"

if [[ -z "$EMAIL" || -z "$PASSWORD" ]]; then
  echo "Usage: $0 <email> <password>"
  exit 1
fi

# DB connection — read the real VPS migration/.env values first.
# PG* env vars still override these if you export them manually.
ENV_FILE="/var/www/digiwebdex/migration/.env"
if [[ -f "$ENV_FILE" ]]; then
  while IFS='=' read -r key value; do
    [[ -z "$key" || "$key" =~ ^[[:space:]]*# ]] && continue
    value="${value%$'\r'}"
    value="${value%\"}"
    value="${value#\"}"
    value="${value%\'}"
    value="${value#\'}"
    case "$key" in
      DB_HOST) DB_HOST="$value" ;;
      DB_PORT) DB_PORT="$value" ;;
      DB_NAME) DB_NAME="$value" ;;
      DB_USER) DB_USER="$value" ;;
      DB_PASSWORD) DB_PASSWORD="$value" ;;
    esac
  done < "$ENV_FILE"
fi

PGHOST="${PGHOST:-${DB_HOST:-127.0.0.1}}"
[[ "$PGHOST" == "localhost" ]] && PGHOST="127.0.0.1"
PGPORT="${PGPORT:-${DB_PORT:-5433}}"
PGUSER="${PGUSER:-${DB_USER:-digiwebdex_user}}"
PGPASSWORD="${PGPASSWORD:-${DB_PASSWORD:-}}"
PGDATABASE="${PGDATABASE:-${DB_NAME:-digiwebdex_db}}"
export PGHOST PGPORT PGUSER PGPASSWORD PGDATABASE

if [[ -z "$PGPASSWORD" ]]; then
  echo "Database password missing. Set DB_PASSWORD in /var/www/digiwebdex/migration/.env or export PGPASSWORD."
  exit 1
fi

# Find a node + bcryptjs we can use (backend has it installed)
BACKEND_DIR="/var/www/digiwebdex/migration/backend"
if [[ ! -d "$BACKEND_DIR/node_modules/bcryptjs" ]]; then
  echo "Installing bcryptjs in $BACKEND_DIR..."
  ( cd "$BACKEND_DIR" && npm install --no-audit --no-fund bcryptjs >/dev/null )
fi

echo "[1/4] Hashing password (bcrypt cost 12)..."
HASH=$(node -e "
const bcrypt = require('$BACKEND_DIR/node_modules/bcryptjs');
process.stdout.write(bcrypt.hashSync(process.argv[1], 12));
" "$PASSWORD")

if [[ -z "$HASH" ]]; then
  echo "Failed to hash password."
  exit 1
fi

echo "[2/4] Upserting user row..."
USER_ID=$(psql -At -v ON_ERROR_STOP=1 <<SQL
INSERT INTO users (email, password_hash, email_verified, email_verified_at, is_active, raw_user_meta_data)
VALUES ('$EMAIL', '$HASH', TRUE, NOW(), TRUE, '{"full_name":"Admin"}'::jsonb)
ON CONFLICT (email) DO UPDATE
  SET password_hash    = EXCLUDED.password_hash,
      email_verified   = TRUE,
      email_verified_at = COALESCE(users.email_verified_at, NOW()),
      is_active        = TRUE,
      updated_at       = NOW()
RETURNING id;
SQL
)

echo "    user_id = $USER_ID"

echo "[3/4] Ensuring profile row..."
psql -v ON_ERROR_STOP=1 <<SQL
INSERT INTO profiles (user_id, full_name)
VALUES ('$USER_ID', 'Admin')
ON CONFLICT (user_id) DO NOTHING;
SQL

echo "[4/4] Granting admin role..."
psql -v ON_ERROR_STOP=1 <<SQL
INSERT INTO user_roles (user_id, role)
VALUES ('$USER_ID', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
SQL

echo
echo "=== DONE ==="
echo "Email:    $EMAIL"
echo "Password: (the one you passed in)"
echo "Role:     admin"
echo
echo "Try logging in now."
