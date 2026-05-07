# Reddit Insights Engine - Deployment & Maintenance Guide

## 🚀 DEPLOYMENT OPTIONS

### Option 1: Vercel (Recommended for Beginners)

**Steps:**
1. Push code to GitHub
2. Connect repo to Vercel (vercel.com)
3. Deploy automatically

**Pros:**
- Free tier (100GB bandwidth)
- Automatic HTTPS
- Global CDN
- Auto deployments on git push

**Cons:**
- Serverless functions timeout after 60s (may affect long jobs)
- Need Pro plan for longer executions

---

### Option 2: VPS / Cloud Server (Recommended for Production)

**Recommended Providers:**
- DigitalOcean Droplet ($6-12/mo)
- Hetzner Cloud ($4-6/mo)
- AWS EC2 t3.small
- Railway.app ($5/mo)

**Server Requirements:**
- 2GB RAM minimum (4GB recommended)
- 1 CPU core minimum
- 20GB SSD storage
- Ubuntu 22.04 or Debian 12

---

## 📦 DEPLOYMENT STEPS (VPS)

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Bun
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

# Install Node.js (for compatibility)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Python for Excel generation
sudo apt install -y python3 python3-pip
pip3 install openpyxl pandas
```

### Step 2: Deploy Application

```bash
# Clone your repository
git clone https://github.com/YOUR_USERNAME/reddit-insights-engine.git
cd reddit-insights-engine

# Install dependencies
bun install

# Build for production
bun run build

# Start with PM2
pm2 start bun --name "reddit-insights" -- run start

# Save PM2 config
pm2 save
pm2 startup
```

### Step 3: Nginx Configuration

```nginx
# /etc/nginx/sites-available/reddit-insights

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Increase timeout for long scraping jobs
        proxy_read_timeout 1800s;
        proxy_connect_timeout 60s;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/reddit-insights /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 4: SSL Certificate (Free)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

## ⚡ PERFORMANCE OPTIMIZATIONS

### 1. Frontend (Already Done)
- ✅ Image optimization (WebP/AVIF)
- ✅ Package import optimization
- ✅ Static asset caching headers
- ✅ Compression enabled

### 2. Backend Optimizations

```bash
# Add to your .env file
NODE_ENV=production
BUN_ENV=production
```

### 3. Database Caching (Optional - for scale)

For high traffic, consider adding:
- Redis for caching results
- PostgreSQL for storing reports

### 4. CDN (Optional)

For faster global delivery:
- Cloudflare (Free tier available)
- Vercel Edge Network
- AWS CloudFront

---

## 🔄 WEEKLY AUTOMATION SETUP

### Method 1: Cron Job (Simple)

```bash
# Edit crontab
crontab -e

# Add this line (runs every Monday at 6 AM)
0 6 * * 1 /home/z/my-project/scripts/weekly_report.sh >> /var/log/reddit-insights.log 2>&1
```

### Method 2: Systemd Timer (More Control)

```ini
# /etc/systemd/system/reddit-insights-weekly.service

[Unit]
Description=Reddit Insights Weekly Report
After=network.target

[Service]
Type=oneshot
ExecStart=/home/z/my-project/scripts/weekly_report.sh
User=www-data
WorkingDirectory=/home/z/my-project

[Install]
WantedBy=multi-user.target
```

```ini
# /etc/systemd/system/reddit-insights-weekly.timer

[Unit]
Description=Run Reddit Insights Weekly

[Timer]
OnCalendar=Monday *-*-* 06:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

```bash
# Enable timer
sudo systemctl daemon-reload
sudo systemctl enable reddit-insights-weekly.timer
sudo systemctl start reddit-insights-weekly.timer
```

---

## 🛠️ MAINTENANCE CHECKLIST

### Weekly Tasks
- [ ] Check logs for errors: `tail -100 /var/log/reddit-insights.log`
- [ ] Verify weekly report was generated
- [ ] Check disk space: `df -h`
- [ ] Review download folder size

### Monthly Tasks
- [ ] Update dependencies: `bun update`
- [ ] Check for security updates: `sudo apt update && sudo apt upgrade`
- [ ] Backup reports to cloud storage
- [ ] Review PM2 status: `pm2 status`

### Quarterly Tasks
- [ ] Review and update target subreddits
- [ ] Update focus topics based on trends
- [ ] Check SSL certificate renewal
- [ ] Performance audit

---

## 💰 ESTIMATED COSTS

| Option | Monthly Cost | Best For |
|--------|-------------|----------|
| Vercel Free | $0 | Testing, personal use |
| Vercel Pro | $20 | Small teams |
| DigitalOcean Droplet | $6-12 | Production use |
| Hetzner Cloud | $4-6 | Budget production |
| Railway | $5 | Simple deployment |
| AWS EC2 | $15-30 | Enterprise scale |

---

## 📊 MONITORING (Optional)

### Simple Health Check Script

```bash
#!/bin/bash
# Add to cron every 5 minutes

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)

if [ "$RESPONSE" != "200" ]; then
    echo "Server down! Restarting..."
    pm2 restart reddit-insights
    # Send alert (email, Slack, etc.)
fi
```

### Recommended Monitoring Tools
- **UptimeRobot** (Free) - Uptime monitoring
- **PM2 Monitoring** - Process monitoring
- **Grafana + Prometheus** - Advanced metrics

---

## 🚨 TROUBLESHOOTING

### Common Issues

**1. Port 3000 already in use**
```bash
lsof -i :3000
kill -9 <PID>
```

**2. Build fails**
```bash
rm -rf .next node_modules
bun install
bun run build
```

**3. Excel generation fails**
```bash
pip3 install --upgrade openpyxl pandas
```

**4. Out of memory during scraping**
- Reduce `maxPostsPerSubreddit` in config
- Increase server RAM
- Add swap space

---

## 📱 QUICK DEPLOY COMMANDS

```bash
# Deploy new version
git pull origin main
bun install
bun run build
pm2 restart reddit-insights

# View logs
pm2 logs reddit-insights

# Check status
pm2 status

# Restart
pm2 restart reddit-insights

# Stop
pm2 stop reddit-insights
```

---

## ✅ PRE-LAUNCH CHECKLIST

- [ ] Domain purchased and DNS configured
- [ ] SSL certificate installed
- [ ] Environment variables set
- [ ] Weekly cron job configured
- [ ] Monitoring setup
- [ ] Backup strategy in place
- [ ] Error logging configured
- [ ] Performance tested
- [ ] Mobile responsive tested
- [ ] Security headers configured

---

**Your Reddit Insights Engine is ready for production! 🎉**
