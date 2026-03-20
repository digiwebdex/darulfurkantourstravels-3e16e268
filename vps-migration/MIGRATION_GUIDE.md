# 🚀 Complete VPS Migration Guide — Darul Furkan Tours & Travels

## No Supabase Cloud. No Lovable. 100% Self-Hosted.

This guide migrates your entire project to your VPS (187.77.144.38) with self-hosted Supabase (Docker), so you own everything.

---

## 📋 Prerequisites

- VPS with Ubuntu 24.04 (you have this ✅)
- SSH access as root (you have this ✅)
- Domain: darulfurkan.com (or your domain)
- At least 4GB RAM, 2 CPU cores

---

## 🔧 STEP 1: Install Required Software

SSH into your server:
```bash
ssh root@187.77.144.38
```

Run this single command to install everything:
```bash
apt update && apt upgrade -y && \
apt install -y curl git nginx certbot python3-certbot-nginx ufw && \
curl -fsSL https://get.docker.com | sh && \
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && \
chmod +x /usr/local/bin/docker-compose && \
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
apt install -y nodejs && \
npm install -g pm2
```

Verify installations:
```bash
docker --version
docker-compose --version
node --version
nginx -v
```

---

## 🗄️ STEP 2: Setup Self-Hosted Supabase

```bash
mkdir -p /var/www/darul-furkan
cd /var/www/darul-furkan

# Clone the official Supabase Docker setup
git clone --depth 1 https://github.com/supabase/supabase.git supabase-docker
cd supabase-docker/docker
```

### Configure Supabase Environment

```bash
cp .env.example .env
```

Now edit the `.env` file:
```bash
nano .env
```

**IMPORTANT: Change these values:**

```env
############
# Secrets - YOU MUST CHANGE THESE
############
POSTGRES_PASSWORD=your-super-secret-db-password-change-this
JWT_SECRET=your-super-secret-jwt-token-with-at-least-32-characters-long
ANON_KEY=<generate-below>
SERVICE_ROLE_KEY=<generate-below>
DASHBOARD_USERNAME=admin
DASHBOARD_PASSWORD=your-dashboard-password

############
# General
############
SITE_URL=https://darulfurkan.com
API_EXTERNAL_URL=https://api.darulfurkan.com
SUPABASE_PUBLIC_URL=https://api.darulfurkan.com

############
# Studio (Dashboard)
############
STUDIO_PORT=3000
STUDIO_DEFAULT_ORGANIZATION=Darul Furkan
STUDIO_DEFAULT_PROJECT=Darul Furkan Tours

############
# Database
############
POSTGRES_HOST=db
POSTGRES_DB=postgres
POSTGRES_PORT=5432
```

### Generate JWT Keys

Go to https://supabase.com/docs/guides/self-hosting/docker#generate-api-keys

Or use this command:
```bash
# Install JWT generator
npm install -g jsonwebtoken

# Generate ANON_KEY (copy the output)
node -e "
const jwt = require('jsonwebtoken');
const secret = 'your-super-secret-jwt-token-with-at-least-32-characters-long';
console.log('ANON_KEY:', jwt.sign({ role: 'anon', iss: 'supabase', iat: Math.floor(Date.now()/1000), exp: Math.floor(Date.now()/1000) + 315360000 }, secret));
console.log('SERVICE_ROLE_KEY:', jwt.sign({ role: 'service_role', iss: 'supabase', iat: Math.floor(Date.now()/1000), exp: Math.floor(Date.now()/1000) + 315360000 }, secret));
"
```

**Copy the output keys into your `.env` file for ANON_KEY and SERVICE_ROLE_KEY.**

### Start Supabase

```bash
docker compose up -d
```

Wait ~2 minutes, then verify:
```bash
docker compose ps
```

All containers should be "Up". Test the API:
```bash
curl http://localhost:8000/rest/v1/ -H "apikey: YOUR_ANON_KEY"
```

---

## 🗃️ STEP 3: Import Your Database

The file `vps-migration/database-schema.sql` contains your entire database. Import it:

```bash
# Copy the SQL file to your server first (from your local machine):
scp vps-migration/database-schema.sql root@187.77.144.38:/var/www/darul-furkan/

# SSH into server and import
ssh root@187.77.144.38

# Import schema into Supabase's PostgreSQL
cd /var/www/darul-furkan/supabase-docker/docker
docker compose exec db psql -U postgres -d postgres -f /var/www/darul-furkan/database-schema.sql
```

### Export Data from Current Database

Before you disconnect from Lovable Cloud, export your data. Run these on your LOCAL machine or anywhere with internet:

```bash
# Install Supabase CLI if not installed
npm install -g supabase

# Export current data (run from project directory)
# You'll need your current Supabase connection string
pg_dump "postgresql://postgres.vdabhwcznnnzhdjthqcg:YOUR_DB_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres" \
  --data-only --no-owner --no-privileges \
  -f data-export.sql

# Copy to VPS
scp data-export.sql root@187.77.144.38:/var/www/darul-furkan/

# Import data on VPS
ssh root@187.77.144.38
cd /var/www/darul-furkan/supabase-docker/docker
docker compose exec db psql -U postgres -d postgres -f /var/www/darul-furkan/data-export.sql
```

---

## 🌐 STEP 4: Build & Deploy the Frontend

### Clone Your Project

```bash
cd /var/www/darul-furkan
git clone https://github.com/digiwebdex/darulfurkantourstravels-3e16e268.git app
cd app
```

### Update Environment Variables

Create the production `.env` file:
```bash
cat > .env << 'EOF'
VITE_SUPABASE_URL=https://api.darulfurkan.com
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_ANON_KEY_FROM_STEP_2
VITE_SUPABASE_PROJECT_ID=darul-furkan-self-hosted
EOF
```

### Build the Frontend

```bash
npm install
npm run build
```

This creates a `dist/` folder with your static site.

---

## 🔒 STEP 5: Configure Nginx

Create the Nginx configuration:

```bash
cat > /etc/nginx/sites-available/darulfurkan << 'NGINX'
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name darulfurkan.com www.darulfurkan.com;
    return 301 https://darulfurkan.com$request_uri;
}

# Main website
server {
    listen 443 ssl http2;
    server_name darulfurkan.com www.darulfurkan.com;

    root /var/www/darul-furkan/app/dist;
    index index.html;

    # SSL will be configured by certbot
    # ssl_certificate /etc/letsencrypt/live/darulfurkan.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/darulfurkan.com/privkey.pem;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing - all routes go to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}

# Supabase API proxy
server {
    listen 80;
    server_name api.darulfurkan.com;
    return 301 https://api.darulfurkan.com$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.darulfurkan.com;

    # SSL will be configured by certbot
    # ssl_certificate /etc/letsencrypt/live/api.darulfurkan.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/api.darulfurkan.com/privkey.pem;

    # Proxy to Supabase Kong
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400;
    }
}

# Supabase Studio (Dashboard) - Optional, restrict access
server {
    listen 443 ssl http2;
    server_name studio.darulfurkan.com;

    # SSL will be configured by certbot

    # Restrict to your IP only
    # allow 202.86.218.24;  # Your IP
    # deny all;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX
```

Enable the site:
```bash
ln -sf /etc/nginx/sites-available/darulfurkan /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

---

## 🔐 STEP 6: Setup SSL (HTTPS)

First, make sure your DNS A records point to 187.77.144.38:
- `darulfurkan.com` → 187.77.144.38
- `www.darulfurkan.com` → 187.77.144.38
- `api.darulfurkan.com` → 187.77.144.38
- `studio.darulfurkan.com` → 187.77.144.38

Then get SSL certificates:
```bash
# Temporarily allow HTTP for certbot verification
# Comment out the HTTPS sections in nginx config first if needed

certbot --nginx -d darulfurkan.com -d www.darulfurkan.com -d api.darulfurkan.com -d studio.darulfurkan.com --email digiwebdex@gmail.com --agree-tos --no-eff-email

# Auto-renewal
systemctl enable certbot.timer
```

---

## 🔥 STEP 7: Configure Firewall

```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

---

## 🛠️ STEP 8: Deploy Edge Functions

Your Supabase Edge Functions will work as-is with the self-hosted setup. Copy them:

```bash
cd /var/www/darul-furkan/supabase-docker/docker

# The edge functions are in your app repo
# They auto-deploy with self-hosted Supabase
# Copy functions to the correct location
cp -r /var/www/darul-furkan/app/supabase/functions/* /var/www/darul-furkan/supabase-docker/docker/volumes/functions/

# Restart the functions container
docker compose restart functions
```

### Set Edge Function Secrets

```bash
cd /var/www/darul-furkan/supabase-docker/docker

# Add any secrets your edge functions need
# Edit docker/.env and add:
# SETUP_ADMIN_SECRET=your-admin-setup-secret
# Add any other secrets your functions use

docker compose restart functions
```

---

## 👤 STEP 9: Create Admin User

After everything is running, create your admin account:

```bash
# Using curl to call the setup-super-admin function
curl -X POST https://api.darulfurkan.com/functions/v1/setup-super-admin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "email": "admin@darulfurkan.com",
    "password": "YourSecurePassword123!",
    "secret_key": "your-admin-setup-secret",
    "role": "admin"
  }'
```

---

## 📦 STEP 10: Setup Auto-Deploy (Optional)

Create a deploy script:

```bash
cat > /var/www/darul-furkan/deploy.sh << 'DEPLOY'
#!/bin/bash
set -e

echo "🚀 Deploying Darul Furkan..."

cd /var/www/darul-furkan/app

# Pull latest code
git pull origin main

# Install dependencies
npm install

# Build
npm run build

# Copy edge functions
cp -r supabase/functions/* /var/www/darul-furkan/supabase-docker/docker/volumes/functions/ 2>/dev/null || true

# Restart edge functions
cd /var/www/darul-furkan/supabase-docker/docker
docker compose restart functions

echo "✅ Deployment complete!"
DEPLOY

chmod +x /var/www/darul-furkan/deploy.sh
```

To deploy updates:
```bash
/var/www/darul-furkan/deploy.sh
```

---

## 🔄 STEP 11: Remove Lovable Dependencies from Code

In your local development, remove the lovable-tagger:

```bash
cd /path/to/your/project
npm uninstall lovable-tagger
```

Edit `vite.config.ts` — remove the lovable-tagger import and plugin:
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "@tanstack/react-query"],
  },
  optimizeDeps: {
    include: ["react", "react-dom", "@tanstack/react-query"],
    force: true,
  },
}));
```

---

## 📊 STEP 12: Verify Everything Works

### Test Checklist:
1. ✅ Visit https://darulfurkan.com — site loads
2. ✅ Visit https://api.darulfurkan.com — API responds  
3. ✅ Visit https://studio.darulfurkan.com — Dashboard loads
4. ✅ Test login/signup on the website
5. ✅ Test admin dashboard at /admin
6. ✅ Test booking flow
7. ✅ Test payment integrations (bKash, Nagad, SSLCommerz)

### Monitor Logs:
```bash
# Supabase logs
cd /var/www/darul-furkan/supabase-docker/docker
docker compose logs -f

# Specific service logs
docker compose logs -f rest    # PostgREST API
docker compose logs -f auth    # GoTrue Auth
docker compose logs -f functions  # Edge Functions

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 🛡️ STEP 13: Backup Strategy

Create daily backups:

```bash
cat > /var/www/darul-furkan/backup.sh << 'BACKUP'
#!/bin/bash
BACKUP_DIR="/var/www/darul-furkan/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Database backup
cd /var/www/darul-furkan/supabase-docker/docker
docker compose exec -T db pg_dump -U postgres postgres > "$BACKUP_DIR/db_$DATE.sql"

# Compress
gzip "$BACKUP_DIR/db_$DATE.sql"

# Keep only last 30 days
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "✅ Backup completed: db_$DATE.sql.gz"
BACKUP

chmod +x /var/www/darul-furkan/backup.sh

# Add daily cron job
(crontab -l 2>/dev/null; echo "0 2 * * * /var/www/darul-furkan/backup.sh >> /var/log/backup.log 2>&1") | crontab -
```

---

## 📝 Quick Reference

| Service | URL |
|---------|-----|
| Website | https://darulfurkan.com |
| API | https://api.darulfurkan.com |
| Dashboard | https://studio.darulfurkan.com |
| Database | localhost:5432 (inside Docker) |

| Command | What it does |
|---------|-------------|
| `cd /var/www/darul-furkan/supabase-docker/docker && docker compose up -d` | Start Supabase |
| `cd /var/www/darul-furkan/supabase-docker/docker && docker compose down` | Stop Supabase |
| `cd /var/www/darul-furkan/supabase-docker/docker && docker compose logs -f` | View logs |
| `/var/www/darul-furkan/deploy.sh` | Deploy updates |
| `/var/www/darul-furkan/backup.sh` | Manual backup |

---

## ⚠️ Important Notes

1. **No code changes needed** — Your React app uses `@supabase/supabase-js` which works with self-hosted Supabase. Just change the URL and anon key in `.env`.

2. **Edge Functions work the same** — Self-hosted Supabase runs Deno edge functions identically.

3. **Auth works the same** — GoTrue handles auth in self-hosted mode exactly like cloud.

4. **Storage works the same** — S3-compatible storage is included in self-hosted Supabase.

5. **DNS is critical** — Make sure `api.darulfurkan.com` points to your VPS before starting.
