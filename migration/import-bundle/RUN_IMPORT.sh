#!/usr/bin/env bash
# DigiWebDex - Phase 1 Data Import (v3 - explicit column lists)
set -euo pipefail

BUNDLE_DIR="/var/www/digiwebdex/migration/import-bundle"
WORK_DIR="/root/digiwebdex-migration"
EXTRACT_ROOT="${WORK_DIR}/migration-export"
STAMP=$(date +%Y%m%d-%H%M)
LOG="/root/import-${STAMP}.log"

echo "=== DigiWebDex Phase 1 Import - ${STAMP} ==="

# 1. Extract fresh
echo "[1/8] Extracting bundle..."
rm -rf "${WORK_DIR}"
mkdir -p "${WORK_DIR}"
tar -xzf "${BUNDLE_DIR}/digiwebdex-migration-phase1.tar.gz" -C "${WORK_DIR}"
CSV_COUNT=$(ls "${EXTRACT_ROOT}"/*.csv 2>/dev/null | wc -l)
PDF_COUNT=$(find "${EXTRACT_ROOT}/storage/invoices" -name '*.pdf' 2>/dev/null | wc -l)
echo "CSV files: ${CSV_COUNT}    PDFs: ${PDF_COUNT}"

# 2. Rewrite vps_import.sql so every \COPY uses an EXPLICIT column list
# from each CSV's header. This protects against column-order mismatch
# between Lovable Cloud and the VPS schema.
echo "[2/8] Rewriting COPY commands with explicit column lists..."
python3 - <<'PYEOF'
import re, csv, os, sys
ROOT = "/root/digiwebdex-migration/migration-export"
SRC  = f"{ROOT}/vps_import.sql"
OUT  = f"{ROOT}/vps_import.fixed.sql"

# Match: \COPY <table> FROM '/import/<file>.csv' WITH (FORMAT csv, HEADER true);
pat = re.compile(
    r"^\\COPY\s+(\w+)\s+FROM\s+'(/import/[^']+\.csv)'\s+WITH\s*\(FORMAT csv,\s*HEADER true\);",
    re.IGNORECASE,
)

def header_for(csv_basename: str):
    path = os.path.join(ROOT, csv_basename)
    if not os.path.exists(path):
        return None
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.reader(f)
        try:
            return next(reader)
        except StopIteration:
            return []

changed = 0
skipped_empty = 0
with open(SRC, "r", encoding="utf-8") as fin, open(OUT, "w", encoding="utf-8") as fout:
    for line in fin:
        m = pat.match(line.strip())
        if not m:
            fout.write(line); continue
        table, container_path = m.group(1), m.group(2)
        basename = os.path.basename(container_path)
        cols = header_for(basename)
        if cols is None:
            fout.write(f"-- SKIPPED (missing CSV): {basename}\n")
            skipped_empty += 1
            continue
        if not cols:
            fout.write(f"-- SKIPPED (empty CSV): {basename}\n")
            skipped_empty += 1
            continue
        col_list = ", ".join(f'"{c}"' for c in cols)
        fout.write(
            f"\\COPY {table} ({col_list}) FROM '{container_path}' "
            f"WITH (FORMAT csv, HEADER true);\n"
        )
        changed += 1

print(f"Rewrote {changed} COPY commands, skipped {skipped_empty} empty/missing CSVs")
PYEOF

# 3. Backup current schema
echo "[3/8] Backing up current schema..."
docker exec digiwebdex-postgres pg_dump -U digiwebdex -d digiwebdex --schema-only \
  > "/root/schema-before-import-${STAMP}.sql"

# 4. Pre-import count
echo "[4/8] Pre-import row count..."
docker exec digiwebdex-postgres psql -U digiwebdex -d digiwebdex -c \
  "SELECT 'users' t, COUNT(*) FROM users UNION ALL SELECT 'invoices', COUNT(*) FROM invoices;"

# 5. Copy CSVs + fixed SQL into the container
echo "[5/8] Copying CSVs into postgres container at /import ..."
docker exec digiwebdex-postgres rm -rf /import /tmp/vps_import.sql
docker exec digiwebdex-postgres mkdir -p /import
for f in "${EXTRACT_ROOT}"/*.csv; do
  docker cp "$f" digiwebdex-postgres:/import/
done
docker cp "${EXTRACT_ROOT}/vps_import.fixed.sql" digiwebdex-postgres:/tmp/vps_import.sql
INSIDE=$(docker exec digiwebdex-postgres sh -c 'ls /import | wc -l')
echo "CSVs in container: ${INSIDE}"

# 6. Run import
echo "[6/8] Running SQL import..."
docker exec digiwebdex-postgres psql -U digiwebdex -d digiwebdex -v ON_ERROR_STOP=1 \
  -f /tmp/vps_import.sql 2>&1 | tee "${LOG}"

# 7. Verify
echo "[7/8] Post-import verification..."
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

# 8. Install PDFs
echo "[8/8] Installing invoice PDFs..."
mkdir -p /var/www/digiwebdex/storage/invoices
cp -f "${EXTRACT_ROOT}/storage/invoices/"*.pdf /var/www/digiwebdex/storage/invoices/ 2>/dev/null || true
chown -R www-data:www-data /var/www/digiwebdex/storage 2>/dev/null || true
ls /var/www/digiwebdex/storage/invoices 2>/dev/null | wc -l | xargs echo "PDFs installed:"

echo ""
echo "=== IMPORT COMPLETE - ${STAMP} ==="
echo "Log: ${LOG}"
