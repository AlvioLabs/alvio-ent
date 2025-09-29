# 🚀 Production Deployment Checklist

## ✅ Pre-Deployment Setup

### Step 1: Use Production Config
```bash
cd deployment/docker_compose

# Backup your local config
cp .env .env.local.backup

# Use production multi-tenant config
cp .env.prod .env
```

### Step 2: Verify Files
```bash
# Check .env has multi-tenant enabled
grep "MULTI_TENANT=true" .env
grep "AUTH_TYPE=google_oauth" .env
grep "WEB_DOMAIN=https://enterprise.alvio.io" .env

# Check .env.nginx has your domain
cat .env.nginx
```

Expected output:
```
MULTI_TENANT=true
AUTH_TYPE=google_oauth
WEB_DOMAIN=https://enterprise.alvio.io

# .env.nginx should show:
DOMAIN=enterprise.alvio.io
EMAIL=verify@alvio.io
```

---

## 🔐 Security Check

### Verify Credentials in .env
```bash
# Check SMTP is configured
grep "SMTP_" .env

# Check API keys exist
grep "GEN_AI_API_KEY" .env
grep "OPENAI_API_KEY" .env
```

Should see:
```
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=verify@alvio.io
SMTP_PASS=osaiwhkaronzgwnt
```

---

## 🌐 DNS Check

### Verify Domain Points to Your Server
```bash
# Check DNS resolution
nslookup enterprise.alvio.io

# Or
dig enterprise.alvio.io
```

**IMPORTANT:** DNS must point to your server before running SSL initialization!

---

## 🔒 SSL Initialization

### Run Let's Encrypt Setup
```bash
cd deployment/docker_compose

# Make script executable
chmod +x init-letsencrypt.sh

# Run SSL initialization
./init-letsencrypt.sh
```

This will:
1. Download TLS parameters
2. Create dummy certificate
3. Start nginx
4. Request real Let's Encrypt certificates
5. Restart services with real certificates

---

## 🐳 Deploy Services

### Build and Start All Services
```bash
cd deployment/docker_compose

# Build from source and start (like your local setup)
docker compose -f docker-compose.prod-cloud.yml up -d --build
```

### Monitor Startup
```bash
# Watch all logs
docker compose -f docker-compose.prod-cloud.yml logs -f

# Watch specific services
docker logs -f onyx-api_server-1
docker logs -f onyx-nginx-1
```

---

## ✅ Verify Deployment

### 1. Check All Containers Running
```bash
docker ps

# Should see these containers:
# - onyx-api_server-1
# - onyx-background-1
# - onyx-web_server-1
# - onyx-relational_db-1
# - onyx-inference_model_server-1
# - onyx-indexing_model_server-1
# - onyx-index-1
# - onyx-nginx-1
# - onyx-certbot-1
# - onyx-minio-1
# - onyx-cache-1
```

### 2. Verify Multi-Tenant is Enabled
```bash
docker exec onyx-api_server-1 env | grep MULTI_TENANT
# Output: MULTI_TENANT=true

docker exec onyx-api_server-1 env | grep ENABLE_PAID
# Output: ENABLE_PAID_ENTERPRISE_EDITION_FEATURES=true
```

### 3. Check Database Migrations
```bash
# Check migration status (should use schema_private for multi-tenant)
docker exec onyx-api_server-1 alembic -n schema_private current
```

### 4. Test API Health
```bash
# From server
curl http://localhost/api/health

# From outside
curl https://enterprise.alvio.io/api/health
```

Expected: `{"status":"ok"}` or similar

### 5. Test Web Access
```bash
# Open in browser
https://enterprise.alvio.io
```

---

## 🎯 Post-Deployment Configuration

### 1. Create Admin User
- Open `https://enterprise.alvio.io`
- Complete initial setup wizard
- Create your admin account

### 2. Configure LLM Provider
- Login as admin
- Go to **Admin → Settings → LLM Provider**
- Verify OpenAI key is working
- Configure other models if needed

### 3. Test Email
- Go to **Admin → Users → Invite**
- Send a test invitation
- Check email arrives

### 4. Add Connectors
- Go to **Admin → Connectors**
- Add your data sources (Slack, Google Drive, Notion, etc.)

---

## 🔧 Common Commands

### View Logs
```bash
# All services
docker compose -f docker-compose.prod-cloud.yml logs -f

# Specific service
docker logs -f onyx-api_server-1
```

### Restart Services
```bash
# All services
docker compose -f docker-compose.prod-cloud.yml restart

# Specific service
docker compose -f docker-compose.prod-cloud.yml restart api_server
```

### Stop Services
```bash
docker compose -f docker-compose.prod-cloud.yml down
```

### Update/Rebuild
```bash
# Rebuild from source
docker compose -f docker-compose.prod-cloud.yml up -d --build

# Pull latest images (for base images like postgres)
docker compose -f docker-compose.prod-cloud.yml pull
```

---

## 🐛 Troubleshooting

### Issue: SSL Certificate Fails
```bash
# Check DNS first
dig enterprise.alvio.io

# Check certbot logs
docker logs onyx-certbot-1

# Try with staging (avoids rate limits)
# Edit init-letsencrypt.sh: change staging=0 to staging=1
```

### Issue: MULTI_TENANT Not Enabled
```bash
# Verify .env file
grep "MULTI_TENANT" .env

# If not set, add it:
echo "MULTI_TENANT=true" >> .env

# Restart services
docker compose -f docker-compose.prod-cloud.yml restart api_server background
```

### Issue: Can't Login with Google OAuth
```bash
# Check OAuth settings
docker exec onyx-api_server-1 env | grep GOOGLE_OAUTH

# Verify callback URL in Google Console:
# https://enterprise.alvio.io/api/auth/google/callback
```

### Issue: Database Connection Failed
```bash
# Check database is running
docker logs onyx-relational_db-1

# Check credentials match
docker exec onyx-api_server-1 env | grep POSTGRES

# Test connection
docker exec onyx-relational_db-1 psql -U postgres -c "SELECT 1"
```

---

## 📊 Configuration Summary

### What You're Deploying

| Setting | Value | Why |
|---------|-------|-----|
| Domain | `enterprise.alvio.io` | Your production domain |
| Multi-Tenant | `true` | Multiple tenant workspaces |
| Auth Type | `google_oauth` | Google login (works well) |
| SSL | Let's Encrypt | Free automated certificates |
| Build Method | From source | Like your local setup |
| Email | Configured | Gmail SMTP for invites |

### Environment Files

| File | Used By | Purpose |
|------|---------|---------|
| `.env` | All services | Main config (from .env.prod) |
| `.env.nginx` | nginx service | SSL/domain config |

---

## ✅ Success Checklist

- [ ] `.env.prod` copied to `.env`
- [ ] DNS points to server
- [ ] Ports 80, 443 open
- [ ] SSL certificates initialized
- [ ] All containers running
- [ ] `MULTI_TENANT=true` verified
- [ ] API health check passes
- [ ] Web UI accessible
- [ ] Admin account created
- [ ] LLM provider configured
- [ ] Email invites working

---

## 🎉 You're Done!

Your multi-tenant Onyx instance is now running at:
**https://enterprise.alvio.io**

Features enabled:
- ✅ Multi-tenant workspaces
- ✅ Enterprise edition features
- ✅ Google OAuth login
- ✅ Email invitations
- ✅ SSL/HTTPS
- ✅ All your API keys configured

Enjoy your production deployment! 🚀
