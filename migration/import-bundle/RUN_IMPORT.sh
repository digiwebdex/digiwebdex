#!/usr/bin/env bash
# DigiWebDex - Phase 1 Data Import (v2 - matches actual bundle layout)
set -euo pipefail

BUNDLE_DIR="/var/www/digiwebdex/migration/import-bundle"
WORK_DIR="/root/digiwebdex-migration"
EXTRACT_ROOT="${WORK_DIR}/migration-export"   # tar has migration-export/ root
STAMP=$(date +%Y%m%d-%H%M)
LOG="/root/import-${STAMP}.log"

echo "=== DigiWebDex Phase 1 Import - ${STAMP} ==="

# 1. Extract bundle fresh
echo "[1/7] Extracting bundle..."
rm -rf "${WORK_DIR}"
mkdir -p "${WORK_DIR}"
tar -xzf "${BUNDLE_DIR}/digiwebdex-migration-phase1.tar.gz" -C "${WORK_DIR}"
test -d "${EXTRACT_ROOT}" || { echo "ERROR: ${EXTRACT_ROOT} missing"; exit 1; }
CSV_COUNT=$(ls "${EXTRACT_ROOT}"/*.csv 2>/dev/null | wc -l)
PDF_COUNT=$(find "${EXTRACT_ROOT}/storage/invoices" -name '*.pdf' 2>/dev/null | wc -l)
echo "CSV files: ${CSV_COUNT}    PDFs: ${PDF_COUNT}"
test "${CSV_COUNT}" -gt 60 || { echo "ERROR: too few CSVs"; exit 1; }

# 2. Backup current schema
echo "[2/7] Backing up current schema -> /root/schema-before-import-${STAMP}.sql"
docker exec digiwebdex-postgres pg_dump -U digiwebdex -d digiwebdex --schema-only \
  > "/root/schema-before-import-${STAMP}.sql"

# 3. Pre-import counts
echo "[3/7] Pre-import row count..."
docker exec digiwebdex-postgres psql -U digiwebdex -d digiwebdex -c \
  "SELECT 'users' t, COUNT(*) FROM users UNION ALL SELECT 'invoices', COUNT(*) FROM invoices;"

# 4. Copy CSVs + SQL into container at /import (matches SQL paths)
echo "[4/7] Copying CSVs into postgres container at /import ..."
docker exec digiwebdex-postgres rm -rf /import /tmp/vps_import.sql
docker exec digiwebdex-postgres mkdir -p /import
# Copy every csv + the sql
for f in "${EXTRACT_ROOT}"/*.csv; do
  docker cp "$f" digiwebdex-postgres:/import/
done
docker cp "${EXTRACT_ROOT}/vps_import.sql" digiwebdex-postgres:/tmp/vps_import.sql
INSIDE=$(docker exec digiwebdex-postgres sh -c 'ls /import | wc -l')
echo "CSVs in container: ${INSIDE}"

# 5. Run import
echo "[5/7] Running SQL import..."
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

# 7. Install invoice PDFs
echo "[7/7] Installing invoice PDFs..."
mkdir -p /var/www/digiwebdex/storage/invoices
if [ -d "${EXTRACT_ROOT}/storage/invoices" ]; then
  cp -f "${EXTRACT_ROOT}/storage/invoices/"*.pdf /var/www/digiwebdex/storage/invoices/ 2>/dev/null || true
fi
chown -R www-data:www-data /var/www/digiwebdex/storage 2>/dev/null || true
ls /var/www/digiwebdex/storage/invoices 2>/dev/null | wc -l | xargs echo "PDFs installed:"

echo ""
echo "=== IMPORT COMPLETE - ${STAMP} ==="
echo "Log: ${LOG}"
echo "Expected: users=29 profiles=29 user_roles=44 services=11 orders=38 invoices=28"
