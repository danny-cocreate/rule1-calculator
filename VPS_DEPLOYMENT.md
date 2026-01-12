# VPS Deployment Guide - Complete Setup

## Quick Deploy (Automated)

Run the deployment script on your VPS:

```bash
cd /path/to/rule1-calculator
chmod +x deploy-vps.sh
./deploy-vps.sh
```

This script will:
1. ✅ Check prerequisites (Python, pip)
2. ✅ Install dependencies
3. ✅ Create/update .env file
4. ✅ Set up systemd service
5. ✅ Configure firewall
6. ✅ Start the service

## Manual Deployment

If you prefer manual setup:

### Step 1: Install Dependencies

```bash
cd /path/to/rule1-calculator/backend
pip3 install --user -r requirements.txt
```

### Step 2: Create .env File

```bash
cd /path/to/rule1-calculator
nano .env
```

Add these variables:

```env
# OpenRouter (for Scuttlebutt research)
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=openai/gpt-4o-mini

# Tavily (for web search)
TAVILY_API_KEY=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

# SEC EDGAR (for ROE calculation)
SEC_USER_AGENT=Rule1Calculator your@email.com

# Backend settings
PORT=8000
```

### Step 3: Create Systemd Service

```bash
sudo nano /etc/systemd/system/fisher-api.service
```

Paste this (update paths and username):

```ini
[Unit]
Description=Fisher Research API
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/rule1-calculator
Environment="PATH=/usr/bin:/usr/local/bin"
EnvironmentFile=/path/to/rule1-calculator/.env
ExecStart=/usr/bin/python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

### Step 4: Enable and Start Service

```bash
sudo systemctl daemon-reload
sudo systemctl enable fisher-api
sudo systemctl start fisher-api
sudo systemctl status fisher-api
```

### Step 5: Configure Firewall

```bash
sudo ufw allow 8000/tcp
sudo ufw reload
```

## Verify Deployment

### Check Service Status

```bash
sudo systemctl status fisher-api
```

Should show: `Active: active (running)`

### Test Health Endpoint

```bash
curl http://localhost:8000/health
```

Should return: `{"status":"healthy"}`

### Test ROE Endpoint

```bash
curl http://localhost:8000/fisher-research/yahoo-roe/NVDA
```

Should return: `{"symbol":"NVDA","roe":107.36,"source":"sec"}`

### Check Logs

```bash
sudo journalctl -u fisher-api -f
```

## Update Netlify

1. Go to Netlify Dashboard → Site settings → Environment variables
2. Set `VITE_SCUTTLEBUTT_API_URL` to your VPS URL:
   - `http://your-vps-ip:8000` (if using HTTP)
   - Or `https://api.yourdomain.com` (if using nginx/SSL)
3. Trigger a new deploy

## Troubleshooting

### Service Won't Start

```bash
# Check logs
sudo journalctl -u fisher-api -n 50

# Check if port is in use
sudo lsof -i :8000

# Check Python path
which python3
```

### Dependencies Missing

```bash
cd /path/to/rule1-calculator/backend
pip3 install --user -r requirements.txt
```

### Environment Variables Not Loading

```bash
# Check .env file exists
cat /path/to/rule1-calculator/.env

# Check service can read it
sudo systemctl show fisher-api | grep EnvironmentFile
```

### Firewall Blocking

```bash
# Check firewall status
sudo ufw status

# Allow port
sudo ufw allow 8000/tcp
sudo ufw reload
```

## Service Management

```bash
# Start service
sudo systemctl start fisher-api

# Stop service
sudo systemctl stop fisher-api

# Restart service
sudo systemctl restart fisher-api

# View logs
sudo journalctl -u fisher-api -f

# Check status
sudo systemctl status fisher-api
```

## Optional: nginx Reverse Proxy with SSL

If you want HTTPS:

### Install nginx and certbot

```bash
sudo apt-get update
sudo apt-get install -y nginx certbot python3-certbot-nginx
```

### Configure nginx

```bash
sudo nano /etc/nginx/sites-available/fisher-api
```

Paste:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and get SSL:

```bash
sudo ln -s /etc/nginx/sites-available/fisher-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d api.yourdomain.com
```

## Next Steps

1. ✅ Backend deployed and running
2. ✅ Update Netlify `VITE_SCUTTLEBUTT_API_URL`
3. ✅ Test from frontend
4. ✅ Monitor logs for any issues
