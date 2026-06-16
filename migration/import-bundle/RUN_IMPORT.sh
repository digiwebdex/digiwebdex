#!/usr/bin/env bash
# DigiWebDex - Phase 1 Data Import
# Run on the VPS from /var/www/digiwebdex/migration/import-bundle/
set -euo pipefail

BUNDLE_DIR="/var/www/digiwebdex/migration/import-bundle"
WORK_DIR="/root/digiwebdex-migration"
STAMP=$(date +%Y%m%d-%H%M)
LOG="/root/import-${STAMP}.log"

echo "=== DigiWebDex Phase 1 Import - ${STAMP} ==="
echo "Logging to: ${LOG}"

# 1. Extract bundle (idempotent: re-extracts cleanly)
echo "[1/7] Extracting bundle..."
rm -rf "${WORK_DIR}"
mkdir -p "${WORK_DIR}"
tar -xzf "${BUNDLE_DIR}/digiwebdex-migration-phase1.tar.gz" -C "${WORK_DIR}" --strip-components=1
ls "${WORK_DIR}/csv" | wc -l | xargs echo "CSV files:"

# 2. Backup current DB
echo "[2/7] Backing up current schema..."
docker exec digiwebdex-postgres pg_dump -U digiwebdex -d digiwebdex --schema-only \
  > "/root/schema-before-import-${STAMP}.sql"

# 3. Snapshot current row counts
echo "[3/7] Pre-import row count..."
docker exec digiwebdex-postgres psql -U digiwebdex -d digiwebdex -c \
  "SELECT 'users' t, COUNT(*) FROM users UNION ALL SELECT 'invoices', COUNT(*) FROM invoices;"

# 4. Copy CSVs + SQL into postgres container
echo "[4/7] Copying CSVs into postgres container..."
docker exec digiwebdex-postgres rm -rf /tmp/csv /tmp/vps_import.sql
docker cp "${WORK_DIR}/csv"            digiwebdex-postgres:/tmp/csv
docker cp "${WORK_DIR}/vps_import.sql" digiwebdex-postgres:/tmp/vps_import.sql
docker exec digiwebdex-postgres ls /tmp/csv | wc -l | xargs echo "CSVs in container:"

# 5. Run import
echo "[5/7] Running SQL import (this can take 30-60s)..."
docker exec digiwebdex-postgres psql -U digiwebdex -d digiwebdex -v ON_ERROR_STOP=1 \
  -f /tmp/vps_import.sql 2>&1 | tee "${LOG}"

# 6. Verify
echo "[6/7] Post-import verification..."
docker exec digiwebdex-postgres psql -U digiwebdex -d digiwebdex -c "
SELECT 'users' t, COUNT(*) FROM users UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles UNION ALL
SELECT 'user_roles', COUNT(*) FROM user_roles UNION ALL
SELECT 'services', COUNT(*) FROM services UNION ALL
SELECT 'orders', COUNT(*) FROM orders UNION ALL
SELECT 'order_items', COUNT(*) FROM order_items UNION ALL
SELECT 'invoices', COUNT(*) FROM invoices UNION ALL
SELECT 'invoice_items', COUNT(*) FROM invoice_items UNION ALL
SELECT 'payments', COUNT(*) FROM payments
ORDER BY t;"

# 7. Move invoice PDFs to storage
echo "[7/7] Installing invoice PDFs..."
mkdir -p /var/www/digiwebdex/storage/invoices
cp -f "${WORK_DIR}/invoices/"*.pdf /var/www/digiwebdex/storage/invoices/ 2>/dev/null || echo "no PDFs in bundle"
chown -R www-data:www-data /var/www/digiwebdex/storage
ls /var/www/digiwebdex/storage/invoices | wc -l | xargs echo "PDFs installed:"

echo ""
echo "=== IMPORT COMPLETE - ${STAMP} ==="
echo "Log: ${LOG}"
echo "Expected: users=29 profiles=29 user_roles=44 services=11 orders=38 invoices=28 invoice_items=66"
