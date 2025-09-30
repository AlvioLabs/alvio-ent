# Which .env File Does Docker Compose Use?

## 🎯 Quick Answer

**Docker Compose automatically loads `.env` from the same directory.**

It does **NOT** automatically load `.env.prod`, `.env.production`, or any other variant.

---

## 📁 Current Situation

You have two env files:
- `.env` - Your current local dev config
- `.env.prod` - Production multi-tenant config (ready to use!)

---

## ✅ Solution: Use `.env.prod` as Your Production Config

### Method 1: Rename to `.env` (Recommended)

```bash
cd deployment/docker_compose

# Backup your local config
cp .env .env.local.backup

# Use production config
cp .env.prod .env

# Verify it's correct
grep "MULTI_TENANT" .env
grep "WEB_DOMAIN" .env
grep "AUTH_TYPE" .env
```

Then deploy normally:
```bash
docker compose -f docker-compose.prod-cloud.yml up -d --build
```

### Method 2: Explicitly Specify .env.prod

```bash
cd deployment/docker_compose

# Use --env-file flag
docker compose -f docker-compose.prod-cloud.yml --env-file .env.prod up -d --build
```

**Note:** You need to use `--env-file .env.prod` every time you run docker compose commands.

---

## 📋 What's in Each File?

### `.env` (Current - Local Dev)
```bash
ENABLE_PAID_ENTERPRISE_EDITION_FEATURES=true
MULTI_TENANT=❌ NOT SET                    # ← Missing!
AUTH_TYPE=basic
WEB_DOMAIN=http://localhost:3000
```

### `.env.prod` (Production Ready) ✅
```bash
ENABLE_PAID_ENTERPRISE_EDITION_FEATURES=true
MULTI_TENANT=true                          # ← Required!
AUTH_TYPE=google_oauth                     # ← Changed from cloud
WEB_DOMAIN=https://enterprise.alvio.io     # ← Production domain

# SMTP Configured ✅
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=verify@alvio.io
SMTP_PASS=osaiwhkaronzgwnt
EMAIL_FROM=verify@alvio.io
ENABLE_EMAIL_INVITES=true
```

---

## 🔐 AUTH_TYPE Explained

### What is `AUTH_TYPE=cloud`?

`AUTH_TYPE=cloud` is designed for Alvio's hosted cloud service with centralized authentication. 

**For self-hosted deployments**, it may not work correctly because:
- It expects cloud infrastructure
- It requires additional cloud-specific configuration
- It's designed for multi-organization SaaS hosting

### ✅ Better Options for Self-Hosted

| Auth Type | Best For | Will It Work? |
|-----------|----------|---------------|
| `basic` | Simple username/password | ✅ Yes - Always works |
| `google_oauth` | Google Workspace teams | ✅ Yes - You have credentials! |
| `oidc` | SSO with Okta/Auth0/etc | ✅ Yes - If you have OIDC provider |
| `saml` | Enterprise SSO | ✅ Yes - Enterprise edition |
| `cloud` | Alvio Cloud hosting | ⚠️ May not work self-hosted |

**I changed `.env.prod` to use `AUTH_TYPE=google_oauth`** since you already have Google OAuth credentials configured.

---

## 🚀 Deployment Steps

### Using .env.prod (Recommended)

```bash
cd deployment/docker_compose

# Step 1: Use production config
cp .env.prod .env

# Step 2: Verify .env.nginx exists
cat .env.nginx
# Should show: DOMAIN=enterprise.alvio.io

# Step 3: Initialize SSL
chmod +x init-letsencrypt.sh
./init-letsencrypt.sh

# Step 4: Deploy
docker compose -f docker-compose.prod-cloud.yml up -d --build
```

---

## 🔍 Verify Configuration

### Check which env file is being used:

```bash
cd deployment/docker_compose

# Docker Compose will show which env file it loads
docker compose -f docker-compose.prod-cloud.yml config | head -20

# Check a specific service's environment
docker compose -f docker-compose.prod-cloud.yml config | grep -A 5 "MULTI_TENANT"
```

### After deployment, verify inside container:

```bash
# Check MULTI_TENANT is enabled
docker exec alvio-api_server-1 env | grep MULTI_TENANT
# Should output: MULTI_TENANT=true

# Check AUTH_TYPE
docker exec alvio-api_server-1 env | grep AUTH_TYPE
# Should output: AUTH_TYPE=google_oauth

# Check WEB_DOMAIN
docker exec alvio-api_server-1 env | grep WEB_DOMAIN
# Should output: WEB_DOMAIN=https://enterprise.alvio.io
```

---

## 📊 Summary Table

| Scenario | Command | Env File Used |
|----------|---------|---------------|
| **Default** | `docker compose up` | `.env` (auto-loaded) |
| **With flag** | `docker compose --env-file .env.prod up` | `.env.prod` (explicit) |
| **Best practice** | `cp .env.prod .env && docker compose up` | `.env` (from .env.prod) |

---

## ⚠️ Important Notes

1. **Docker Compose ONLY auto-loads `.env`** - no other variations
2. **nginx uses `.env.nginx`** - this is specified explicitly in docker-compose.prod-cloud.yml
3. **Variables in docker-compose.yml use syntax** `${VAR_NAME:-default}`
4. **Both services and containers** read from the same .env file

---

## 🎯 Final Recommendation

**Use Method 1:**
```bash
cp .env.prod .env
docker compose -f docker-compose.prod-cloud.yml up -d --build
```

This way:
- ✅ You don't need `--env-file` flag every time
- ✅ All docker compose commands work normally
- ✅ Clear which config is active (production)
- ✅ Your local config is backed up as `.env.local.backup`

---

## 📚 Files Summary

| File | Purpose | Auto-loaded? | Status |
|------|---------|--------------|--------|
| `.env` | Main config | ✅ Yes | Use .env.prod content |
| `.env.prod` | Production template | ❌ No | ✅ Ready with SMTP & google_oauth |
| `.env.nginx` | SSL/domain config | ✅ Yes (nginx only) | ✅ Ready |
| `.env.local.backup` | Your local backup | ❌ No | For reference |

Done! 🎉
