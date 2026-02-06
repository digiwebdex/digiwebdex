# Digiwebdex Production Deployment Guide

## Prerequisites

- Docker and Docker Compose installed
- Domain configured with DNS pointing to server
- SSL certificate (recommend using Certbot/Let's Encrypt)

## Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/digiwebdex.git
cd digiwebdex

# Copy environment file
cp .env.production.example .env.production

# Edit with your values
nano .env.production

# Build and start
docker-compose up -d --build

# Check status
docker-compose ps
docker-compose logs -f app
```

## SSL/HTTPS Setup

For production, use Certbot for free SSL certificates:

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d digiwebdex.com -d www.digiwebdex.com

# Auto-renewal is set up automatically
```

Then update `docker/default.conf` to include SSL configuration.

## Security Checklist

### Before Deployment

- [ ] Update all secrets in `.env.production`
- [ ] Generate strong `WEBHOOK_SECRET` and `CRON_SECRET`
- [ ] Review and test RLS policies in Supabase
- [ ] Enable audit logging
- [ ] Configure rate limiting thresholds

### Post-Deployment

- [ ] Enable HSTS header (after confirming HTTPS works)
- [ ] Set up monitoring (Uptime, Error tracking)
- [ ] Configure backup schedule
- [ ] Test health check endpoint: `curl https://digiwebdex.com/health`

## Monitoring

### Health Check

```bash
# Basic health check
curl -f http://localhost/health

# Detailed health check (via edge function)
curl https://qszmmysnwjvywpsofbgs.supabase.co/functions/v1/health-check?detailed=true
```

### Logs

```bash
# View application logs
docker-compose logs -f app

# View nginx access logs
docker exec digiwebdex-app tail -f /var/log/nginx/access.log

# View nginx error logs
docker exec digiwebdex-app tail -f /var/log/nginx/error.log
```

## Backup

Database backups are handled by the `database-backup` edge function:

```bash
# Trigger manual backup (requires admin auth)
curl -X POST \
  https://qszmmysnwjvywpsofbgs.supabase.co/functions/v1/database-backup \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

For automated backups, set up a cron job to call this endpoint daily.

## Scaling

For high traffic, consider:

1. **Horizontal scaling**: Add more app containers behind a load balancer
2. **CDN**: Use Cloudflare or similar for static asset caching
3. **Database**: Supabase handles scaling automatically
4. **Edge Functions**: Auto-scale with Supabase

## Troubleshooting

### Common Issues

1. **502 Bad Gateway**: Check if app container is running
2. **Rate Limited**: Check nginx rate limit logs
3. **Auth Issues**: Verify Supabase keys in environment

### Debug Mode

```bash
# Enable debug logging temporarily
docker exec digiwebdex-app sh -c "export LOG_LEVEL=debug && nginx -s reload"
```

## Support

- Documentation: https://docs.digiwebdex.com
- Issues: https://github.com/your-org/digiwebdex/issues
