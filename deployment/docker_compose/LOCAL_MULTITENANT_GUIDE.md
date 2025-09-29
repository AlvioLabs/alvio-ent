# 🏠 Running Multi-Tenant Locally with Basic Auth

## ✅ What I Changed in Your `.env`

Your `.env` is now configured for **local multi-tenant development** with basic auth:

### Key Changes:
1. ✅ **Added `MULTI_TENANT=true`** - Enables multi-tenant mode
2. ✅ **Added `POSTGRES_DB=postgres`** - Required for multi-tenant
3. ✅ **Added `DB_READONLY_USER` and `DB_READONLY_PASSWORD`** - For analytics
4. ✅ **Enabled SMTP** - For email invitations
5. ✅ **Set `SESSION_EXPIRE_TIME_SECONDS=604800`** - 7 day sessions
6. ✅ **Kept `WEB_DOMAIN=http://localhost:3000`** - Local URL
7. ✅ **Kept `AUTH_TYPE=basic`** - Username/password login

### What Matches `.env.prod`:
- All settings are identical to `.env.prod` 
- **EXCEPT:** `WEB_DOMAIN` (localhost vs enterprise.alvio.io) and `AUTH_TYPE` (basic vs google_oauth)

---

## 🚀 How to Run Locally with Multi-Tenant

### Option 1: Using Your Existing Build Setup

```bash
cd deployment/docker_compose

# Build and start with multi-tenant
docker compose -f docker-compose.multitenant-dev.yml -f docker-compose.build-only.yml up -d --build
```

### Option 2: Using docker-compose.prod-cloud.yml Locally

You can also test the production compose file locally:

```bash
cd deployment/docker_compose

# Build and start
docker compose -f docker-compose.prod-cloud.yml -f docker-compose.build-only.yml up -d --build
```

**Note:** The `.env` file will be used automatically (with localhost URL and basic auth).

---

## 🔍 Verify Multi-Tenant is Working

### Check Environment Variables

```bash
# Verify MULTI_TENANT is enabled
docker exec onyx-api_server-1 env | grep MULTI_TENANT
# Should output: MULTI_TENANT=true

docker exec onyx-api_server-1 env | grep AUTH_TYPE
# Should output: AUTH_TYPE=basic

docker exec onyx-api_server-1 env | grep WEB_DOMAIN
# Should output: WEB_DOMAIN=http://localhost:3000
```

### Check Database Migrations

Multi-tenant uses **schema_private** migrations:

```bash
# Check current migration (multi-tenant)
docker exec onyx-api_server-1 alembic -n schema_private current

# If migrations didn't run, run them manually:
docker exec onyx-api_server-1 alembic -n schema_private upgrade head
```

---

## 🎯 What is Multi-Tenant Mode?

### Single-Tenant vs Multi-Tenant

| Feature | Single-Tenant | Multi-Tenant |
|---------|--------------|--------------|
| **Users** | All users share one workspace | Users grouped by tenant/organization |
| **Data Isolation** | All data in one schema | Each tenant has separate PostgreSQL schema |
| **Use Case** | One company/team | Multiple companies/teams on same instance |
| **Migrations** | `alembic upgrade head` | `alembic -n schema_private upgrade head` |

### Example Multi-Tenant Usage

**Tenant 1: Company A**
- Users: alice@companyA.com, bob@companyA.com
- Documents: Only Company A's documents
- Connectors: Only Company A's integrations

**Tenant 2: Company B**
- Users: charlie@companyB.com, diana@companyB.com
- Documents: Only Company B's documents
- Connectors: Only Company B's integrations

**Complete isolation!** Users from Tenant 1 cannot see Tenant 2's data.

---

## 🔑 Basic Auth with Multi-Tenant

### How Login Works

1. **Create Account**: Visit `http://localhost:3000` → Sign up with email/password
2. **Tenant Assignment**: First user creates a new tenant automatically
3. **Invite Others**: Invite team members via email (SMTP configured)
4. **Login**: Username/password login (no OAuth needed)

### Creating Your First Tenant

```bash
# 1. Start the application
docker compose -f docker-compose.multitenant-dev.yml up -d

# 2. Open browser
# http://localhost:3000

# 3. Sign up with any email/password
# This creates:
# - Your user account
# - A new tenant (organization)
# - You as the admin of that tenant

# 4. Invite team members
# Go to Admin → Users → Invite
# They'll be added to YOUR tenant
```

---

## 📊 Current Configuration Summary

### Your `.env` Settings

```bash
# Core Multi-Tenant Settings
ENABLE_PAID_ENTERPRISE_EDITION_FEATURES=true
MULTI_TENANT=true

# Local Development
WEB_DOMAIN=http://localhost:3000
AUTH_TYPE=basic

# Database (Multi-Tenant)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=postgres

# Email/Invitations
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=verify@alvio.io
EMAIL_FROM=verify@alvio.io
ENABLE_EMAIL_INVITES=true

# All your API keys (OpenAI, AWS, etc.) ✅
```

---

## 🔄 Switching Between Single and Multi-Tenant

### To Disable Multi-Tenant (Go Back to Single-Tenant)

```bash
# Edit .env
MULTI_TENANT=false

# Restart services
docker compose -f docker-compose.multitenant-dev.yml restart
```

**Warning:** If you have multi-tenant data, switching back may cause issues. Best to use separate environments.

---

## 🆚 Local vs Production Comparison

| Setting | Local (.env) | Production (.env.prod) |
|---------|-------------|----------------------|
| `MULTI_TENANT` | ✅ `true` | ✅ `true` |
| `ENABLE_PAID_ENTERPRISE_EDITION_FEATURES` | ✅ `true` | ✅ `true` |
| `WEB_DOMAIN` | `http://localhost:3000` | `https://enterprise.alvio.io` |
| `AUTH_TYPE` | `basic` | `google_oauth` |
| SMTP | ✅ Configured | ✅ Configured |
| API Keys | ✅ Same | ✅ Same |
| Database | ✅ Same settings | ✅ Same settings |

**Almost identical!** Only difference is the domain and auth method.

---

## ✅ What You Can Test Locally

With your current setup, you can now test:

✅ **Multi-Tenant Features**
- Creating multiple tenants
- User isolation between tenants
- Tenant-specific connectors
- Tenant-specific documents

✅ **Basic Auth**
- Username/password signup
- Email invitations
- User management

✅ **Email Invitations**
- Send invites via Gmail SMTP
- Users receive invitation emails
- One-click signup from email

✅ **All Enterprise Features**
- Advanced connectors
- Custom permissions
- Analytics

---

## 🐛 Troubleshooting

### Issue: Migrations Fail

```bash
# Check migration status
docker exec onyx-api_server-1 alembic -n schema_private current

# Run migrations manually
docker exec onyx-api_server-1 alembic -n schema_private upgrade head

# Restart API server
docker compose -f docker-compose.multitenant-dev.yml restart api_server
```

### Issue: Can't Create Account

```bash
# Check API logs
docker logs onyx-api_server-1

# Check database connection
docker exec onyx-relational_db-1 psql -U postgres -c "SELECT 1"

# Verify MULTI_TENANT is set
docker exec onyx-api_server-1 env | grep MULTI_TENANT
```

### Issue: Email Invites Not Sending

```bash
# Check SMTP settings in container
docker exec onyx-api_server-1 env | grep SMTP

# Check API logs for SMTP errors
docker logs onyx-api_server-1 | grep -i smtp

# Test SMTP connection
# Make sure verify@alvio.io can send emails via Gmail
```

---

## 📝 Testing Multi-Tenant Locally

### Create Two Tenants

1. **Tenant 1 - Incognito Window**
   ```
   Open: http://localhost:3000 (incognito)
   Sign up: alice@example.com / password123
   → Creates Tenant 1
   ```

2. **Tenant 2 - Regular Window**
   ```
   Open: http://localhost:3000 (regular window)
   Sign up: bob@anothercompany.com / password456
   → Creates Tenant 2
   ```

3. **Verify Isolation**
   - Upload document in Tenant 1
   - Switch to Tenant 2
   - Document should NOT appear in Tenant 2

---

## 🎉 Summary

Your `.env` is now configured for:

✅ **Multi-Tenant Mode** - Multiple organizations on one instance
✅ **Basic Auth** - Simple username/password login (good for local testing)
✅ **Local Development** - Runs on localhost:3000
✅ **Email Invitations** - SMTP configured for invites
✅ **All Enterprise Features** - Same as production
✅ **Same API Keys** - All your credentials configured

**Ready to run multi-tenant locally!**

### Start Command:

```bash
cd deployment/docker_compose
docker compose -f docker-compose.multitenant-dev.yml -f docker-compose.build-only.yml up -d --build
```

Then open: `http://localhost:3000` and create your first tenant! 🚀
