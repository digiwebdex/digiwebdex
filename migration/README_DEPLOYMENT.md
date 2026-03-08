# DigiWebDex VPS Migration Guide

## Prerequisites
- Ubuntu 22.04+ VPS (Hostinger KVM)
- Docker & Docker Compose installed
- Domain DNS pointing to VPS IP

## Quick Start

```bash
# 1. Upload migration folder to VPS
scp -r migration/ user@your-vps:/opt/digiwebdex/

# 2. SSH into VPS
ssh user@your-vps
cd /opt/digiwebdex/migration

# 3. Create environment file
cp backend/.env.example backend/.env
nano backend/.env  # Fill in all values

# 4. Initialize database
cat database/enums.sql database/schema.sql database/functions.sql database/triggers.sql > database/init.sql

# 5. Start services
docker-compose up -d --build

# 6. Verify
curl http://localhost:3001/api/health
```

## Database Migration

To import existing data:
```bash
# Export from Supabase (use their dashboard or pg_dump)
# Then import:
docker exec -i digiwebdex-db psql -U digiwebdex -d digiwebdex < data_export.sql
```

## Frontend Changes Required

Update `src/lib/api.ts` to use new backend:
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'https://api.digiwebdex.com';
```

Replace all `supabase.from()` calls with fetch to `/api/*` endpoints.

## SSL Setup
```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d digiwebdex.com -d www.digiwebdex.com
```

## API Endpoints Mapping

| Supabase Edge Function | New Express Endpoint |
|------------------------|---------------------|
| send-email | POST /api/notifications/send-email |
| send-sms | POST /api/notifications/send-sms |
| send-otp | POST /api/auth/send-otp |
| verify-otp | POST /api/auth/verify-otp |
| contact-notification | POST /api/notifications/contact-notification |
| lead-notification | POST /api/notifications/lead-notification |
| health-check | GET /api/health |
| daily-csv-backup | POST /api/backup/run |
| admin-create-user | POST /api/users |

## Monitoring
```bash
docker-compose logs -f backend
docker exec digiwebdex-db psql -U digiwebdex -c "SELECT COUNT(*) FROM orders;"
```
