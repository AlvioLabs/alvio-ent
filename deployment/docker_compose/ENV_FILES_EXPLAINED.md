# Environment Files Explained

## 📁 Which .env Files Do You Need?

### For Production Multi-Tenant Deployment

Docker Compose automatically loads `.env` from the same directory. You have two options:

### ✅ **Option 1: Use `.env` directly (Simplest)**
```bash
cd deployment/docker_compose

# Update your existing .env file with these critical settings:
# - MULTI_TENANT=true
# - ENABLE_PAID_ENTERPRISE_EDITION_FEATURES=true
# - AUTH_TYPE=cloud
# - WEB_DOMAIN=https://enterprise.alvio.io

# Then deploy
docker compose -f docker-compose.prod-cloud.yml up -d --build
```

### ✅ **Option 2: Use `.env.prod` (Separate configs)**
```bash
cd deployment/docker_compose

# Rename/copy .env.prod to .env
cp .env.prod .env

# Then deploy
docker compose -f docker-compose.prod-cloud.yml up -d --build
```

### ✅ **Option 3: Explicitly specify env file**
```bash
cd deployment/docker_compose

# Use .env.prod explicitly
docker compose -f docker-compose.prod-cloud.yml --env-file .env.prod up -d --build
```

---

## 📋 Required Files Summary

| File | Purpose | Required? | Notes |
|------|---------|-----------|-------|
| `.env` | Main application config | ✅ **YES** | Auto-loaded by docker-compose |
| `.env.prod` | Production-specific config | ⚠️ Optional | Pre-configured alternative to .env |
| `.env.nginx` | Nginx/SSL config | ✅ **YES** | Used by nginx service for Let's Encrypt |
| `.env.nginx.template` | Template for .env.nginx | ❌ No | Just a template |
| `env.prod.template` | Template for .env | ❌ No | Just a template |

---

## 🔄 Files I Created For You

### ✅ `.env.nginx` (Ready to use!)
```bash
DOMAIN=enterprise.alvio.io
EMAIL=verify@alvio.io
ALVIO_BACKEND_API_HOST=api_server
ALVIO_WEB_SERVER_HOST=web_server
```
**Status:** ✅ Ready - No changes needed

### ✅ `.env.prod` (Multi-tenant production config)
Based on your existing `.env` but with:
- `MULTI_TENANT=true` ✅
- `ENABLE_PAID_ENTERPRISE_EDITION_FEATURES=true` ✅
- `AUTH_TYPE=cloud` ✅
- `WEB_DOMAIN=https://enterprise.alvio.io` ✅
- All your existing API keys preserved ✅

**Status:** ✅ Ready - Uses your existing passwords/keys

### ✅ `docker-compose.prod-cloud.yml` (Updated!)
**Changes made:**
- ❌ Removed all `image:` lines → Now builds from source ✅
- ✅ Added `MULTI_TENANT=true` support
- ✅ Added all required environment variables
- ✅ Configured for multi-tenant migrations

---

## 🚀 Deployment Steps

### Step 1: Choose Your .env Strategy

**Recommended: Use .env.prod as your .env**
```bash
cd deployment/docker_compose

# Backup your current .env
cp .env .env.local.backup

# Use production config
cp .env.prod .env

# Verify .env.nginx exists
cat .env.nginx
```

### Step 2: Initialize SSL
```bash
cd deployment/docker_compose
chmod +x init-letsencrypt.sh
./init-letsencrypt.sh
```

### Step 3: Deploy
```bash
cd deployment/docker_compose

# Build from source and deploy
docker compose -f docker-compose.prod-cloud.yml up -d --build
```

---

## ⚙️ What `docker-compose.prod-cloud.yml` Reads

### Automatically Loaded
- ✅ `.env` in the same directory (main config)

### Explicitly Loaded
- ✅ `.env.nginx` (only for nginx service, specified with `env_file:`)

### How Environment Loading Works
```yaml
# docker-compose.prod-cloud.yml

services:
  api_server:
    # Reads from .env automatically
    environment:
      - MULTI_TENANT=${MULTI_TENANT:-true}
      # ↑ Looks for MULTI_TENANT in .env

  nginx:
    # Reads from .env.nginx explicitly
    env_file:
      - .env.nginx
```

---

## 🔍 Key Differences: Local vs Production

| Setting | Local (.env) | Production (.env.prod) |
|---------|-------------|----------------------|
| `MULTI_TENANT` | ❌ Not set | ✅ `true` |
| `ENABLE_PAID_ENTERPRISE_EDITION_FEATURES` | ✅ `true` | ✅ `true` |
| `AUTH_TYPE` | `basic` | `cloud` |
| `WEB_DOMAIN` | `http://localhost:3000` | `https://enterprise.alvio.io` |
| Build | From source | From source (after update) ✅ |
| SSL | None | Let's Encrypt ✅ |
| Migrations | Standard | Multi-tenant (schema_private) ✅ |

---

## ✅ Verify Your Setup

### Check .env files exist
```bash
cd deployment/docker_compose
ls -la .env*
```

You should see:
```
.env                    # Main config (use .env.prod as base)
.env.nginx              # Nginx config ✅ Ready
.env.nginx.template     # Template (ignore)
.env.prod              # Production multi-tenant config ✅ Ready
```

### Check critical settings
```bash
# Check main .env has multi-tenant enabled
grep "MULTI_TENANT" .env
# Should output: MULTI_TENANT=true

grep "ENABLE_PAID_ENTERPRISE_EDITION_FEATURES" .env
# Should output: ENABLE_PAID_ENTERPRISE_EDITION_FEATURES=true

grep "WEB_DOMAIN" .env
# Should output: WEB_DOMAIN=https://enterprise.alvio.io
```

---

## 🔐 Security Checklist

Before deploying, update these in your `.env`:

```bash
# Generate new encryption key
openssl rand -hex 32
# Update: ENCRYPTION_KEY_SECRET=<new-key>

# Generate strong database password
openssl rand -base64 32
# Update: POSTGRES_PASSWORD=<new-password>

# Generate strong MinIO password
openssl rand -base64 32
# Update: MINIO_ROOT_PASSWORD=<new-password>
# Update: S3_AWS_SECRET_ACCESS_KEY=<same-as-MINIO_ROOT_PASSWORD>
```

---

## 🎯 Quick Commands

```bash
# Use .env.prod as your .env
cp .env.prod .env

# Initialize SSL
./init-letsencrypt.sh

# Deploy (builds from source)
docker compose -f docker-compose.prod-cloud.yml up -d --build

# Check logs
docker compose -f docker-compose.prod-cloud.yml logs -f api_server

# Verify multi-tenant is enabled
docker exec alvio-api_server-1 env | grep MULTI_TENANT
```

---

## ❓ FAQ

**Q: Do I need both .env and .env.prod?**
A: No. Docker Compose only reads `.env` automatically. `.env.prod` is a pre-configured template you can copy to `.env`.

**Q: Can I use .env.prod directly without renaming?**
A: Yes, with: `docker compose --env-file .env.prod -f docker-compose.prod-cloud.yml up -d`

**Q: Why is .env.nginx separate?**
A: Because only the nginx service needs SSL/domain config. Keeping it separate is cleaner.

**Q: Will my local setup still work?**
A: Yes! Keep your original `.env` backed up as `.env.local` and swap between them.

**Q: What if I don't want to use cloud auth?**
A: You can use `AUTH_TYPE=google_oauth` or `AUTH_TYPE=oidc` - just make sure `MULTI_TENANT=true` is still set.

---

## 📚 Summary

**You now have:**
1. ✅ `.env.prod` - Production multi-tenant config with all your API keys
2. ✅ `.env.nginx` - SSL/domain config
3. ✅ `docker-compose.prod-cloud.yml` - Updated to build from source with multi-tenant support

**To deploy:**
```bash
cp .env.prod .env
./init-letsencrypt.sh
docker compose -f docker-compose.prod-cloud.yml up -d --build
```

Done! 🎉
