#!/bin/bash
# ================================================
# Darul Furkan Tours - One-Click VPS Setup Script
# Run as root on Ubuntu 24.04
# Usage: bash setup.sh
# ================================================

set -e

echo "🚀 ============================================"
echo "   Darul Furkan Tours - VPS Setup"
echo "   ============================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_DIR="/var/www/darul-furkan"
GITHUB_REPO="https://github.com/digiwebdex/darulfurkantourstravels-3e16e268.git"

# ---- Step 1: Install dependencies ----
echo -e "${YELLOW}[1/8] Installing system dependencies...${NC}"
apt update -qq
apt install -y -qq curl git nginx certbot python3-certbot-nginx ufw > /dev/null 2>&1

# Docker
if ! command -v docker &> /dev/null; then
    echo "  Installing Docker..."
    curl -fsSL https://get.docker.com | sh > /dev/null 2>&1
fi

# Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "  Installing Docker Compose..."
    curl -sL "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Node.js
if ! command -v node &> /dev/null; then
    echo "  Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
    apt install -y -qq nodejs > /dev/null 2>&1
fi

echo -e "${GREEN}  ✅ Dependencies installed${NC}"

# ---- Step 2: Create project directory ----
echo -e "${YELLOW}[2/8] Setting up project directory...${NC}"
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# ---- Step 3: Setup Self-hosted Supabase ----
echo -e "${YELLOW}[3/8] Setting up self-hosted Supabase...${NC}"
if [ ! -d "$PROJECT_DIR/supabase-docker" ]; then
    git clone --depth 1 https://github.com/supabase/supabase.git supabase-docker > /dev/null 2>&1
fi

cd $PROJECT_DIR/supabase-docker/docker

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${RED}  ⚠️  IMPORTANT: Edit the .env file before continuing!${NC}"
    echo "  File: $PROJECT_DIR/supabase-docker/docker/.env"
    echo ""
    echo "  You MUST change these values:"
    echo "    - POSTGRES_PASSWORD"
    echo "    - JWT_SECRET (at least 32 characters)"
    echo "    - ANON_KEY (generate with JWT)"
    echo "    - SERVICE_ROLE_KEY (generate with JWT)"
    echo "    - DASHBOARD_USERNAME"
    echo "    - DASHBOARD_PASSWORD"
    echo "    - SITE_URL=https://darulfurkan.com"
    echo "    - API_EXTERNAL_URL=https://api.darulfurkan.com"
    echo ""
    echo -e "${YELLOW}  After editing .env, run this script again.${NC}"
    echo ""
    echo "  To generate JWT keys, run:"
    echo "    npm install -g jsonwebtoken"
    echo '    node -e "const jwt=require('"'"'jsonwebtoken'"'"');const s='"'"'YOUR_JWT_SECRET_HERE'"'"';console.log('"'"'ANON:'"'"',jwt.sign({role:'"'"'anon'"'"',iss:'"'"'supabase'"'"',iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+315360000},s));console.log('"'"'SERVICE:'"'"',jwt.sign({role:'"'"'service_role'"'"',iss:'"'"'supabase'"'"',iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+315360000},s))"'
    exit 0
fi

# Check if Supabase is already running
if ! docker compose ps --status running 2>/dev/null | grep -q "supabase"; then
    echo "  Starting Supabase containers..."
    docker compose up -d
    echo "  Waiting for Supabase to start (60s)..."
    sleep 60
fi
echo -e "${GREEN}  ✅ Supabase running${NC}"

# ---- Step 4: Clone and build frontend ----
echo -e "${YELLOW}[4/8] Cloning and building frontend...${NC}"
cd $PROJECT_DIR

if [ ! -d "app" ]; then
    git clone $GITHUB_REPO app > /dev/null 2>&1
fi

cd app

# Get the Supabase URL and anon key from docker env
SUPABASE_URL=$(grep "API_EXTERNAL_URL" $PROJECT_DIR/supabase-docker/docker/.env | cut -d= -f2 | tr -d '"')
ANON_KEY=$(grep "^ANON_KEY" $PROJECT_DIR/supabase-docker/docker/.env | cut -d= -f2 | tr -d '"')

# Create production env
cat > .env << EOF
VITE_SUPABASE_URL=${SUPABASE_URL:-https://api.darulfurkan.com}
VITE_SUPABASE_PUBLISHABLE_KEY=${ANON_KEY:-your-anon-key}
VITE_SUPABASE_PROJECT_ID=darul-furkan-self-hosted
EOF

# Remove lovable-tagger dependency
if grep -q "lovable-tagger" package.json; then
    npm uninstall lovable-tagger 2>/dev/null || true
    # Fix vite.config.ts to remove lovable-tagger
    sed -i '/lovable-tagger/d' vite.config.ts
    sed -i '/componentTagger/d' vite.config.ts
    # Fix the plugins array
    sed -i 's/plugins: \[react(), .*\]/plugins: [react()]/' vite.config.ts
fi

npm install --legacy-peer-deps > /dev/null 2>&1
npm run build

echo -e "${GREEN}  ✅ Frontend built${NC}"

# ---- Step 5: Import database schema ----
echo -e "${YELLOW}[5/8] Importing database schema...${NC}"
if [ -f "$PROJECT_DIR/database-schema.sql" ]; then
    cd $PROJECT_DIR/supabase-docker/docker
    docker compose cp $PROJECT_DIR/database-schema.sql db:/tmp/schema.sql
    docker compose exec -T db psql -U postgres -d postgres -f /tmp/schema.sql > /dev/null 2>&1 || true
    echo -e "${GREEN}  ✅ Database schema imported${NC}"
else
    echo -e "${YELLOW}  ⚠️  No database-schema.sql found. Copy it to $PROJECT_DIR/ and re-run.${NC}"
fi

# ---- Step 6: Setup Nginx ----
echo -e "${YELLOW}[6/8] Configuring Nginx...${NC}"

cat > /etc/nginx/sites-available/darulfurkan << 'NGINX'
server {
    listen 80;
    server_name darulfurkan.com www.darulfurkan.com;

    root /var/www/darul-furkan/app/dist;
    index index.html;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}

server {
    listen 80;
    server_name api.darulfurkan.com;

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

server {
    listen 80;
    server_name studio.darulfurkan.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/darulfurkan /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo -e "${GREEN}  ✅ Nginx configured${NC}"

# ---- Step 7: Setup Firewall ----
echo -e "${YELLOW}[7/8] Configuring firewall...${NC}"
ufw default deny incoming > /dev/null 2>&1
ufw default allow outgoing > /dev/null 2>&1
ufw allow ssh > /dev/null 2>&1
ufw allow 80/tcp > /dev/null 2>&1
ufw allow 443/tcp > /dev/null 2>&1
echo "y" | ufw enable > /dev/null 2>&1
echo -e "${GREEN}  ✅ Firewall configured${NC}"

# ---- Step 8: Create helper scripts ----
echo -e "${YELLOW}[8/8] Creating helper scripts...${NC}"

# Deploy script
cat > $PROJECT_DIR/deploy.sh << 'DEPLOY'
#!/bin/bash
set -e
echo "🚀 Deploying Darul Furkan..."
cd /var/www/darul-furkan/app
git pull origin main
npm install --legacy-peer-deps
npm run build
echo "✅ Deployment complete!"
DEPLOY
chmod +x $PROJECT_DIR/deploy.sh

# Backup script
cat > $PROJECT_DIR/backup.sh << 'BACKUP'
#!/bin/bash
BACKUP_DIR="/var/www/darul-furkan/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
cd /var/www/darul-furkan/supabase-docker/docker
docker compose exec -T db pg_dump -U postgres postgres > "$BACKUP_DIR/db_$DATE.sql"
gzip "$BACKUP_DIR/db_$DATE.sql"
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete
echo "✅ Backup: db_$DATE.sql.gz"
BACKUP
chmod +x $PROJECT_DIR/backup.sh

# Add daily backup cron
(crontab -l 2>/dev/null; echo "0 2 * * * $PROJECT_DIR/backup.sh >> /var/log/darul-furkan-backup.log 2>&1") | sort -u | crontab -

echo -e "${GREEN}  ✅ Helper scripts created${NC}"

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  🎉 Setup Complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "  Next steps:"
echo "  1. Point DNS A records to this server IP:"
echo "     - darulfurkan.com → $(curl -s ifconfig.me)"
echo "     - api.darulfurkan.com → $(curl -s ifconfig.me)"
echo "     - studio.darulfurkan.com → $(curl -s ifconfig.me)"
echo ""
echo "  2. Get SSL certificates:"
echo "     certbot --nginx -d darulfurkan.com -d www.darulfurkan.com -d api.darulfurkan.com -d studio.darulfurkan.com"
echo ""
echo "  3. Import your data (if you exported from current database)"
echo ""
echo "  4. Create admin user:"
echo '     curl -X POST https://api.darulfurkan.com/functions/v1/setup-super-admin \'
echo '       -H "Content-Type: application/json" \'
echo '       -H "Authorization: Bearer YOUR_ANON_KEY" \'
echo '       -d '"'"'{"email":"admin@darulfurkan.com","password":"YourPass123!","secret_key":"your-secret","role":"admin"}'"'"''
echo ""
echo "  Helper commands:"
echo "    Deploy:  $PROJECT_DIR/deploy.sh"
echo "    Backup:  $PROJECT_DIR/backup.sh"
echo "    Logs:    cd $PROJECT_DIR/supabase-docker/docker && docker compose logs -f"
