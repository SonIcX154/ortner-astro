# 🚀 Deployment Guide for QNAP NAS

This guide explains how to deploy your Astro portfolio site to a QNAP NAS.

## 📋 Prerequisites

### On Your QNAP NAS

1. **Enable SSH access**: Control Panel → Network & File Services → Telnet/SSH
2. **Install Web Server**: Install "Web Server" from App Center
3. **Create shared folder**: For your web files (e.g., `Web/portfolio`)
4. **Note your NAS IP**: Usually `192.168.x.x` or similar

### On Your PC

1. **SSH client**: Windows Terminal, PuTTY, or WSL
2. **SCP/SFTP client**: WinSCP, FileZilla, or built-in commands
3. **Node.js & npm**: For building the site

## 🔧 Deployment Methods

### Method 1: Automated Script (Recommended)

1. **Build the site locally**:

   ```bash
   npm run build
   ```

2. **Run the deployment script**:

   ```bash
   # Basic usage (will prompt for details)
   ./deploy.sh

   # Or specify all parameters
   ./deploy.sh 192.168.1.100 admin /share/Web/portfolio
   ```

3. **First-time setup**: Configure SSH key or ensure password auth works

### Method 2: Manual Upload

1. **Build the site**:

   ```bash
   npm run build
   ```

2. **Connect to your NAS**:

   ```bash
   # Using SCP (secure copy)
   scp -r dist/* admin@YOUR_NAS_IP:/share/Web/portfolio/

   # Or using rsync for efficiency
   rsync -avz dist/ \
     admin@NAS_IP:/share/Web/portfolio/
   ```

3. **Set proper permissions on NAS**:

   ```bash
   ssh admin@YOUR_NAS_IP
   find /share/Web/portfolio -type f -name "*.html" -exec chmod 644 {} \;
   find /share/Web/portfolio -type f \( -name "*.css" -o \
     -name "*.js" \) -exec chmod 644 {} \;
   find /share/Web/portfolio -type d -exec chmod 755 {} \;
   ```

### Method 3: Build Directly on NAS (Advanced)

If your QNAP has Node.js installed via Container Station:

1. **Transfer source code to NAS**:

   ```bash
   scp -r . admin@YOUR_NAS_IP:/share/Source/portfolio/
   ```

2. **SSH to NAS and build**:

   ```bash
   ssh admin@YOUR_NAS_IP
   cd /share/Source/portfolio
   npm install
   npm run build
   cp -r dist/* /share/Web/portfolio/
   ```

## 🌐 Configure QNAP Web Server

1. **Access Web Server settings**:
   - Go to Storage & Snapshots → Shared Folders
   - Find your web folder (e.g., `Web`)
   - Right-click → Edit Properties → Network & Sharing
   - Enable "Web Access"

2. **Set up Virtual Host** (if using multiple sites):
   - Web Server → Virtual Host
   - Create new virtual host for your domain
   - Point document root to your portfolio folder

3. **Configure Domain**:
   - If using custom domain, configure DNS to point to your NAS IP
   - Set up port forwarding on your router if needed

## 🔍 Testing Your Deployment

1. **Test locally on NAS**:

   ```bash
   curl http://localhost/portfolio/
   ```

2. **Test from external network**:

   ```bash
   curl http://YOUR_NAS_IP/portfolio/
   ```

3. **Check all routes**:
   - Homepage: `http://your-domain.com/`
   - Pages: `http://your-domain.com/your-page-slug`
   - Blog: `http://your-domain.com/blog`
   - RSS: `http://your-domain.com/rss.xml`
   - Sitemap: `http://your-domain.com/sitemap.xml`

## 🔄 Updating Your Site

1. **Make changes locally**
2. **Test changes**: `npm run dev`
3. **Build and deploy**: `npm run build && ./deploy.sh`
4. **Verify deployment**

## 🚨 Troubleshooting

### "Permission denied" errors

- Ensure SSH access is enabled on QNAP
- Check username/password or SSH key setup
- Verify user has write access to target folder

### "Connection refused" errors

- Check NAS IP address
- Ensure SSH service is running
- Verify firewall settings

### Site not loading

- Check QNAP Web Server is running
- Verify folder permissions (755 for directories, 644 for files)
- Ensure index.html exists in root

### WordPress API not working

- Update `.env` to use internal NAS networking
- Example: `WORDPRESS_API_URL=http://localhost:8080/wp-json/wp/v2`

## 📊 Performance Tips

1. **Enable compression** in QNAP Web Server settings
2. **Set up SSL certificate** for HTTPS
3. **Configure caching headers** for static assets
4. **Use internal networking** for WordPress API calls

## 🔒 Security Considerations

1. **Use strong passwords** for NAS access
2. **Enable 2FA** on QNAP if available
3. **Keep QNAP firmware updated**
4. **Use HTTPS** for production sites
5. **Restrict SSH access** to specific IPs if possible

## 📞 Support

If you encounter issues:

1. Check QNAP system logs: Control Panel → System Logs
2. Verify web server logs: Web Server → Logs
3. Test network connectivity between services
4. Ensure all required ports are open
