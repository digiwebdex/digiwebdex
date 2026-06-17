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
# To avoid stale terminal exports breaking login repair, migration/.env wins by default.
# If you intentionally want to use existing PG* env vars, run with USE_PG_ENV=1.
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

if [[ "${USE_PG_ENV:-0}" == "1" ]]; then
  PGHOST="${PGHOST:-${DB_HOST:-127.0.0.1}}"
  PGPORT="${PGPORT:-${DB_PORT:-5433}}"
  PGUSER="${PGUSER:-${DB_USER:-digiwebdex}}"
  PGPASSWORD="${PGPASSWORD:-${DB_PASSWORD:-}}"
  PGDATABASE="${PGDATABASE:-${DB_NAME:-digiwebdex}}"
else
  PGHOST="${DB_HOST:-127.0.0.1}"
  PGPORT="${DB_PORT:-5433}"
  PGUSER="${DB_USER:-digiwebdex}"
  PGPASSWORD="${DB_PASSWORD:-}"
  PGDATABASE="${DB_NAME:-digiwebdex}"
fi
[[ "$PGHOST" == "localhost" ]] && PGHOST="127.0.0.1"
export PGHOST PGPORT PGUSER PGPASSWORD PGDATABASE

if [[ -z "$PGPASSWORD" ]]; then
  echo "Database password missing. Set DB_PASSWORD in /var/www/digiwebdex/migration/.env or export PGPASSWORD."
  exit 1
fi

echo "Using database: $PGUSER@$PGHOST:$PGPORT/$PGDATABASE"

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
USER_ID=$(psql -At -v ON_ERROR_STOP=1 \
  -v email="$EMAIL" \
  -v password_hash="$HASH" \
  <<'SQL'
INSERT INTO users (email, password_hash, email_verified, email_verified_at, is_active, raw_user_meta_data)
VALUES (lower(:'email'), :'password_hash', TRUE, NOW(), TRUE, '{"full_name":"Admin"}'::jsonb)
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
psql -v ON_ERROR_STOP=1 -v user_id="$USER_ID" <<'SQL'
INSERT INTO profiles (user_id, full_name)
VALUES (:'user_id', 'Admin')
ON CONFLICT (user_id) DO NOTHING;
SQL

echo "[4/4] Granting admin role..."
psql -v ON_ERROR_STOP=1 -v user_id="$USER_ID" <<'SQL'
INSERT INTO user_roles (user_id, role)
VALUES (:'user_id', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
SQL

echo "[5/5] Verifying stored login credentials..."
VERIFY=$(node - <<'NODE' "$BACKEND_DIR" "$EMAIL" "$PASSWORD"
const backendDir = process.argv[2];
const email = process.argv[3].toLowerCase();
const password = process.argv[4];
const { Client } = require(`${backendDir}/node_modules/pg`);
const bcrypt = require(`${backendDir}/node_modules/bcryptjs`);

(async () => {
  const client = new Client();
  await client.connect();
  const { rows } = await client.query(
    `SELECT u.id, u.email, u.password_hash, u.email_verified, u.is_active, ur.role
     FROM users u
     LEFT JOIN user_roles ur ON u.id = ur.user_id
     WHERE u.email = $1
     ORDER BY CASE WHEN ur.role = 'admin' THEN 0 ELSE 1 END
     LIMIT 1`,
    [email]
  );
  await client.end();
  if (!rows[0]) {
    console.log('missing_user');
    process.exit(1);
  }
  const ok = await bcrypt.compare(password, rows[0].password_hash || '');
  console.log(JSON.stringify({
    email: rows[0].email,
    is_active: rows[0].is_active,
    email_verified: rows[0].email_verified,
    role: rows[0].role,
    password_matches: ok,
  }));
  if (!ok || !rows[0].is_active || rows[0].role !== 'admin') process.exit(1);
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
NODE
)
echo "    $VERIFY"

echo
echo "=== DONE ==="
echo "Email:    $EMAIL"
echo "Password: (the one you passed in)"
echo "Role:     admin"
echo
echo "Try logging in now."
