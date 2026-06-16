# Phase 1 — Data Import Bundle

This folder is auto-deployed to the VPS via Lovable → GitHub → cron.

## Contents
- `digiwebdex-migration-phase1.tar.gz` — 2.1 MB bundle (69 CSVs + 19 invoice PDFs + `vps_import.sql`)
- `RUN_IMPORT.sh` — one-shot import script

## How to run on VPS

```bash
cd /var/www/digiwebdex/migration/import-bundle
chmod +x RUN_IMPORT.sh
sudo ./RUN_IMPORT.sh
```

The script: extracts → backs up schema → copies CSVs into the postgres container →
runs `vps_import.sql` with `ON_ERROR_STOP=1` → prints row counts → installs invoice PDFs.

Expected counts: **users=29, profiles=29, user_roles=44, services=11, orders=38,
invoices=28, invoice_items=66**.
