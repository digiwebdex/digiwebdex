#!/bin/bash
# ============================================================
# DigiWebDex Production Deployment Script
# Run this on your LOCAL machine (not VPS)
# ============================================================

set -e

VPS_IP="187.77.144.38"
VPS_USER="root"
PROJECT_DIR="/var/www/digiwebdex"

echo "=========================================="
echo "DigiWebDex Production Deployment"
echo "=========================================="

# Step 1: Build Frontend
echo ""
echo "[1/5] Building frontend..."
cd "$(dirname "$0")/../.."
npm install --legacy-peer-deps
npm run build

if [ ! -d "dist" ]; then
    echo "ERROR: Build failed - dist/ directory not found"
    exit 1
fi
echo "✅ Frontend built successfully"

# Step 2: Create frontend directory on VPS
echo ""
echo "[2/5] Preparing VPS directories..."
ssh ${VPS_USER}@${VPS_IP} "mkdir -p ${PROJECT_DIR}/frontend/dist"
echo "✅ VPS directories ready"

# Step 3: Upload built frontend
echo ""
echo "[3/5] Uploading frontend to VPS..."
scp -r dist/* ${VPS_USER}@${VPS_IP}:${PROJECT_DIR}/frontend/dist/
echo "✅ Frontend uploaded"

# Step 4: Upload migration files
echo ""
echo "[4/5] Uploading migration data..."
scp migration/database/data_seed.sql ${VPS_USER}@${VPS_IP}:${PROJECT_DIR}/database/
echo "✅ Migration data uploaded"

# Step 5: Import data and restart services
echo ""
echo "[5/5] Importing data & restarting services..."
ssh ${VPS_USER}@${VPS_IP} << 'REMOTE_SCRIPT'
cd /var/www/digiwebdex

# Import seed data into PostgreSQL
echo "Importing database seed data..."
docker compose exec -T postgres psql -U digiwebdex_user -d digiwebdex_db < database/data_seed.sql

# Restart backend to pick up any changes
docker compose restart backend

# Reload nginx
sudo systemctl reload nginx

echo "✅ All services restarted"
REMOTE_SCRIPT

echo ""
echo "=========================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "=========================================="
echo ""
echo "Visit: https://digiwebdex.com"
echo ""
echo "Post-deployment checklist:"
echo "  1. Visit https://digiwebdex.com and verify homepage loads"
echo "  2. Test login at https://digiwebdex.com/en/auth/login"  
echo "  3. Check API health: curl https://digiwebdex.com/api/health"
echo "  4. Verify Docker: ssh ${VPS_USER}@${VPS_IP} 'cd ${PROJECT_DIR} && docker compose ps'"
echo ""
