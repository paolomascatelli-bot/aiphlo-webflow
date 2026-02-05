#!/bin/bash

# =========================================
# AIPHLO DEPLOY SCRIPT
# One-command deployment to Railway
# =========================================

set -e

echo ""
echo "🚀 AiPhlo Deployment Script"
echo "==========================="
echo ""

# Check for Railway CLI
if ! command -v railway &> /dev/null; then
    echo "📦 Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Please log in to Railway:"
    railway login
fi

# Navigate to project root
cd "$(dirname "$0")/.."
PROJECT_ROOT=$(pwd)

echo "📁 Project root: $PROJECT_ROOT"
echo ""

# Check if Railway project exists
if [ ! -f ".railway/config.json" ]; then
    echo "🆕 Creating new Railway project..."
    railway init
fi

# Create railway.json config if not exists
if [ ! -f "railway.json" ]; then
    echo "📝 Creating Railway config..."
    cat > railway.json << 'EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node api/server.js",
    "healthcheckPath": "/health",
    "restartPolicyType": "ON_FAILURE"
  }
}
EOF
fi

# Create Procfile for Railway
echo "web: node api/server.js" > Procfile

echo "🚂 Deploying to Railway..."
railway up --detach

echo ""
echo "⏳ Waiting for deployment..."
sleep 5

# Get the deployment URL
DEPLOY_URL=$(railway domain 2>/dev/null || echo "")

if [ -z "$DEPLOY_URL" ]; then
    echo ""
    echo "🌐 Setting up domain..."
    railway domain
    DEPLOY_URL=$(railway domain 2>/dev/null)
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "==========================="
echo "🌐 Your site is live at:"
echo "   https://$DEPLOY_URL"
echo ""
echo "📋 API Endpoints:"
echo "   POST https://$DEPLOY_URL/v1/populate"
echo "   GET  https://$DEPLOY_URL/health"
echo ""
echo "🔧 Next steps:"
echo "   1. Update template URLs from localhost:3001 to $DEPLOY_URL"
echo "   2. Add custom domain in Railway dashboard"
echo "   3. Configure DNS: CNAME → $DEPLOY_URL"
echo "==========================="
echo ""

# Create a production config file
cat > .env.production << EOF
API_URL=https://$DEPLOY_URL
EOF

echo "📝 Created .env.production with your deployment URL"
