#!/usr/bin/env bash
# DigiWebDex - Phase 1 Data Import (v4 - schema-aware column intersection)
set -euo pipefail

BUNDLE_DIR="/var/www/digiwebdex/migration/import-bundle"
WORK_DIR="/root/digiwebdex-migration"
EXTRACT_ROOT="${WORK_DIR}/migration-export"
STAMP=$(date +%Y%m%d-%H%M)
LOG="/root/import-${STAMP}.log"
CONTAINER="digiwebdex-postgres"
DB_USER="digiwebdex"
DB_NAME="digiwebdex"

echo "=== DigiWebDex Phase 1 Import - ${STAMP} ==="

# 1. Extract fresh
echo "[1/8] Extracting bundle..."
rm -rf "${WORK_DIR}"
mkdir -p "${WORK_DIR}"
tar -xzf "${BUNDLE_DIR}/digiwebdex-migration-phase1.tar.gz" -C "${WORK_DIR}"
CSV_COUNT=$(ls "${EXTRACT_ROOT}"/*.csv 2>/dev/null | wc -l)
PDF_COUNT=$(find "${EXTRACT_ROOT}/storage/invoices" -name '*.pdf' 2>/dev/null | wc -l)
echo "CSV files: ${CSV_COUNT}    PDFs: ${PDF_COUNT}"

# 2. Backup schema first (we need it for column introspection)
echo "[2/8] Backing up current schema..."
docker exec "${CONTAINER}" pg_dump -U "${DB_USER}" -d "${DB_NAME}" --schema-only \
  > "/root/schema-before-import-${STAMP}.sql"

# 3. Dump VPS column map (table -> ordered columns) for the public schema
echo "[3/8] Reading live VPS schema for column intersection..."
docker exec "${CONTAINER}" psql -U "${DB_USER}" -d "${DB_NAME}" -A -t -F $'\t' -c "
SELECT table_name, column_name
FROM information_schema.columns
WHERE table_schema='public'
ORDER BY table_name, ordinal_position;
" > "${WORK_DIR}/vps_columns.tsv"

# Also dump NOT NULL columns that have NO default (these must be filled)
docker exec "${CONTAINER}" psql -U "${DB_USER}" -d "${DB_NAME}" -A -t -F $'\t' -c "
SELECT table_name, column_name
FROM information_schema.columns
WHERE table_schema='public'
  AND is_nullable='NO'
  AND column_default IS NULL;
" > "${WORK_DIR}/vps_notnull.tsv"

echo "Tables found: $(cut -f1 ${WORK_DIR}/vps_columns.tsv | sort -u | wc -l)"
echo "NOT NULL (no default) cols: $(wc -l < ${WORK_DIR}/vps_notnull.tsv)"

# 4. Rewrite vps_import.sql:
#    - Skip tables that don't exist on VPS
#    - For tables that exist: COPY only columns that exist on BOTH sides,
#      strip extras from each CSV row before COPY.
echo "[4/8] Rewriting COPY commands (schema-aware intersection)..."
python3 - <<'PYEOF'
import re, csv, os, sys
from collections import defaultdict

ROOT = "/root/digiwebdex-migration/migration-export"
SRC  = f"{ROOT}/vps_import.sql"
OUT  = f"{ROOT}/vps_import.fixed.sql"
COLMAP = "/root/digiwebdex-migration/vps_columns.tsv"
FILT_DIR = f"{ROOT}/_filtered"
os.makedirs(FILT_DIR, exist_ok=True)

# Load VPS columns
vps_cols = defaultdict(list)
with open(COLMAP, encoding="utf-8") as f:
    for line in f:
        line = line.rstrip("\n")
        if not line or "\t" not in line: continue
        t, c = line.split("\t", 1)
        vps_cols[t].append(c)

pat = re.compile(
    r"^\\COPY\s+(\w+)\s+FROM\s+'(/import/[^']+\.csv)'\s+WITH\s*\(FORMAT csv,\s*HEADER true\);",
    re.IGNORECASE,
)

def read_csv_header(path):
    with open(path, newline="", encoding="utf-8") as f:
        return next(csv.reader(f), [])

def slugify(s):
    import re as _re
    s = (s or "").strip().lower()
    s = _re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s or None

def filter_csv(src_path, keep_idx, dst_path, kept_cols, src_header):
    # Indices in the source CSV for helpful fallback fields
    idx = {c: i for i, c in enumerate(src_header)}
    slug_pos = kept_cols.index("slug") if "slug" in kept_cols else -1
    with open(src_path, newline="", encoding="utf-8") as fin, \
         open(dst_path, "w", newline="", encoding="utf-8") as fout:
        r = csv.reader(fin); w = csv.writer(fout)
        header = next(r, None)
        if header is None: return 0
        w.writerow(kept_cols)
        n = 0
        for row in r:
            if len(row) < len(header):
                row = row + [""]*(len(header)-len(row))
            out = [row[i] for i in keep_idx]
            # Auto-fill slug if NOT NULL on VPS but empty in CSV
            if slug_pos >= 0 and not out[slug_pos]:
                src = ""
                for cand in ("slug","name_en","name","title_en","title","name_bn"):
                    if cand in idx and row[idx[cand]]:
                        src = row[idx[cand]]; break
                if not src and "id" in idx:
                    src = row[idx["id"]][:8]
                out[slug_pos] = slugify(src) or (row[idx["id"]][:8] if "id" in idx else "row")
            w.writerow(out)
            n += 1
        return n

rewrote = skipped_missing_table = skipped_no_columns = skipped_missing_csv = 0
report = []

tx_pat = re.compile(r"^\s*(BEGIN|COMMIT|ROLLBACK)\s*;?\s*$", re.IGNORECASE)

with open(SRC, "r", encoding="utf-8") as fin, open(OUT, "w", encoding="utf-8") as fout:
    for line in fin:
        # Strip outer BEGIN/COMMIT/ROLLBACK so one failure doesn't abort everything
        if tx_pat.match(line):
            fout.write(f"-- (stripped) {line}")
            continue
        m = pat.match(line.strip())
        if not m:
            fout.write(line); continue
        table, container_path = m.group(1), m.group(2)
        basename = os.path.basename(container_path)
        src_csv = os.path.join(ROOT, basename)

        if not os.path.exists(src_csv):
            fout.write(f"-- SKIPPED (missing CSV): {basename}\n")
            skipped_missing_csv += 1; continue

        if table not in vps_cols:
            fout.write(f"-- SKIPPED (table missing on VPS): {table}\n")
            report.append(f"SKIP table-missing: {table}")
            skipped_missing_table += 1; continue

        csv_header = read_csv_header(src_csv)
        vps_set = set(vps_cols[table])
        keep_idx = [i for i, c in enumerate(csv_header) if c in vps_set]
        kept_cols = [csv_header[i] for i in keep_idx]
        dropped = [c for c in csv_header if c not in vps_set]

        if not kept_cols:
            fout.write(f"-- SKIPPED (no matching columns): {table}\n")
            report.append(f"SKIP no-cols: {table} (csv has {csv_header}, vps has {sorted(vps_set)})")
            skipped_no_columns += 1; continue

        # Write a filtered CSV containing ONLY the columns that exist on VPS
        filt_name = f"_filtered/{basename}"
        filt_path = os.path.join(ROOT, filt_name)
        rows = filter_csv(src_csv, keep_idx, filt_path, kept_cols, csv_header)

        col_list = ", ".join(f'"{c}"' for c in kept_cols)
        fout.write(
            f"\\COPY {table} ({col_list}) FROM '/import/{filt_name}' "
            f"WITH (FORMAT csv, HEADER true);\n"
        )
        rewrote += 1
        if dropped:
            report.append(f"OK {table}: kept {len(kept_cols)} cols, dropped {dropped} ({rows} rows)")
        else:
            report.append(f"OK {table}: all {len(kept_cols)} cols ({rows} rows)")

print(f"Rewrote: {rewrote}")
print(f"Skipped (table missing on VPS): {skipped_missing_table}")
print(f"Skipped (no matching columns):  {skipped_no_columns}")
print(f"Skipped (CSV file missing):     {skipped_missing_csv}")
print("--- per-table report ---")
for r in report: print(r)
PYEOF

# 5. Copy filtered CSVs + fixed SQL into the container
echo "[5/8] Copying filtered CSVs into postgres container at /import ..."
docker exec "${CONTAINER}" rm -rf /import /tmp/vps_import.sql
docker exec "${CONTAINER}" mkdir -p /import /import/_filtered
for f in "${EXTRACT_ROOT}"/*.csv; do
  docker cp "$f" "${CONTAINER}:/import/" >/dev/null
done
for f in "${EXTRACT_ROOT}"/_filtered/*.csv; do
  [ -e "$f" ] || continue
  docker cp "$f" "${CONTAINER}:/import/_filtered/" >/dev/null
done
docker cp "${EXTRACT_ROOT}/vps_import.fixed.sql" "${CONTAINER}:/tmp/vps_import.sql" >/dev/null
INSIDE=$(docker exec "${CONTAINER}" sh -c 'ls /import/_filtered 2>/dev/null | wc -l')
echo "Filtered CSVs in container: ${INSIDE}"

# 6. Run import - continue on errors so one bad table doesn't abort everything
echo "[6/8] Running SQL import (continue-on-error)..."
docker exec "${CONTAINER}" psql -U "${DB_USER}" -d "${DB_NAME}" -v ON_ERROR_STOP=0 \
  -f /tmp/vps_import.sql 2>&1 | tee "${LOG}"

ERRORS=$(grep -cE '^psql:.*ERROR:' "${LOG}" || true)
echo ""
echo ">>> Total SQL errors: ${ERRORS} (see ${LOG})"

# 7. Verify
echo "[7/8] Post-import verification..."
docker exec "${CONTAINER}" psql -U "${DB_USER}" -d "${DB_NAME}" -c "
SELECT 'users' t, COUNT(*) FROM users UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles UNION ALL
SELECT 'user_roles', COUNT(*) FROM user_roles UNION ALL
SELECT 'services', COUNT(*) FROM services UNION ALL
SELECT 'orders', COUNT(*) FROM orders UNION ALL
SELECT 'order_items', COUNT(*) FROM order_items UNION ALL
SELECT 'invoices', COUNT(*) FROM invoices UNION ALL
SELECT 'invoice_items', COUNT(*) FROM invoice_items UNION ALL
SELECT 'payments', COUNT(*) FROM payments
ORDER BY t;" || true

# 8. Install PDFs
echo "[8/8] Installing invoice PDFs..."
mkdir -p /var/www/digiwebdex/storage/invoices
cp -f "${EXTRACT_ROOT}/storage/invoices/"*.pdf /var/www/digiwebdex/storage/invoices/ 2>/dev/null || true
chown -R www-data:www-data /var/www/digiwebdex/storage 2>/dev/null || true
ls /var/www/digiwebdex/storage/invoices 2>/dev/null | wc -l | xargs echo "PDFs installed:"

echo ""
echo "=== IMPORT COMPLETE - ${STAMP} ==="
echo "Log: ${LOG}"
