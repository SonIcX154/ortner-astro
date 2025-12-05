#!/bin/bash

# Deployment script for QNAP NAS
# Usage: ./deploy.sh [nas-ip] [username] [web-root-path]

set -e  # Exit on error
set -u  # Exit on undefined variable

# Configuration
NAS_IP=${1:-"192.168.1.200"}
NAS_USER=${2:-"astro"}
WEB_ROOT=${3:-"/Web/Astro"}
BUILD_DIR="dist"

echo "🚀 Deploying Astro site to QNAP NAS"
echo "======================================"

# Build first if dist doesn't exist or is old
if [ ! -d "$BUILD_DIR" ]; then
    echo "📦 Building Astro site..."
    npm run build || { echo "❌ Build failed! Fix errors and try again."; exit 1; }
    echo "✅ Build completed successfully"
else
    echo "📦 Using existing build: $BUILD_DIR"
    read -p "⚠️  Rebuild first? (y/N): " rebuild
    if [[ $rebuild =~ ^[Yy]$ ]]; then
        npm run build || { echo "❌ Build failed! Fix errors and try again."; exit 1; }
        echo "✅ Build completed successfully"
    fi
fi

# Test connection
echo "🔍 Testing connection to NAS..."
if ! ssh -o ConnectTimeout=10 "$NAS_USER@$NAS_IP" "echo 'Connection successful'" 2>/dev/null; then
    echo "❌ Cannot connect to NAS. Please check:"
    echo "   - NAS IP address: $NAS_IP"
    echo "   - Username: $NAS_USER"
    echo "   - SSH access is enabled on QNAP"
    echo "   - You have the correct SSH key or password"
    exit 1
fi

echo "✅ NAS connection successful"

# Create backup on NAS
echo "💾 Creating backup on NAS..."
ssh "$NAS_USER@$NAS_IP" "cd '$WEB_ROOT' && [ -d 'current' ] && cp -r current backup-\$(date +%Y%m%d_%H%M%S) || echo 'No existing site to backup'"

# Upload new build
echo "📤 Uploading new build to NAS..."
rsync -avz --delete "$BUILD_DIR/" "$NAS_USER@$NAS_IP:$WEB_ROOT/current/" || { 
    echo "❌ Upload failed! Rolling back..."
    ssh "$NAS_USER@$NAS_IP" "cd '$WEB_ROOT' && rm -rf current && mv backup-* current 2>/dev/null || true"
    exit 1
}

# Set proper permissions
echo "🔒 Setting proper permissions..."
ssh "$NAS_USER@$NAS_IP" "find '$WEB_ROOT/current' -type f -name '*.html' -exec chmod 644 {} \; && find '$WEB_ROOT/current' -type f -name '*.css' -o -name '*.js' -exec chmod 644 {} \; && find '$WEB_ROOT/current' -type d -exec chmod 755 {} \;"

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "🌐 Your site should now be available at:"
echo "   http://$NAS_IP/portfolio/"
echo "   (or whatever URL your QNAP web server is configured for)"
echo ""
echo "📝 Next steps:"
echo "   1. Verify the site loads correctly"
echo "   2. Update your DNS if needed"
echo "   3. Configure SSL certificate if required"
echo ""
echo "💡 Tip: Add this to your crontab for auto-deploy:"
echo "   0 2 * * * cd /path/to/ortner-astro && ./deploy.sh"
