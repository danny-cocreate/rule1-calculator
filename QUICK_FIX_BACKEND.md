# Quick Fix: Backend Connection Issue

## The Problem

Your backend at `https://srv999305.hstgr.cloud:8000` is not accessible. The diagnostic shows:
- ❌ Connection timeout on port 8000
- ✅ Server is reachable (base domain works)

This means: **The backend is not running on port 8000**

## Quick Fix (5 Minutes)

### Step 1: SSH into VPS
```bash
ssh your-user@srv999305.hstgr.cloud
```

### Step 2: Navigate to Project
```bash
cd /path/to/rule1-calculator
```

### Step 3: Start Backend
```bash
# Quick start (for testing)
python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

### Step 4: Test (in another terminal)
```bash
curl http://srv999305.hstgr.cloud:8000/health
```

Should return: `{"status":"healthy"}`

### Step 5: Update Netlify
1. Go to Netlify Dashboard → Site settings → Environment variables
2. Set `VITE_SCUTTLEBUTT_API_URL` = `http://srv999305.hstgr.cloud:8000` (use HTTP, not HTTPS)
3. Trigger new deploy

## Make It Permanent

After testing works, set up as a service:

```bash
sudo nano /etc/systemd/system/fisher-api.service
```

Paste:
```ini
[Unit]
Description=Fisher Research API
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/rule1-calculator
ExecStart=/usr/bin/python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl daemon-reload
sudo systemctl enable fisher-api
sudo systemctl start fisher-api
```

## Check Firewall

```bash
sudo ufw allow 8000/tcp
sudo ufw reload
```

## Verify

Run the diagnostic script on your VPS:
```bash
./scripts/vps-backend-check.sh
```

Or manually:
```bash
curl http://srv999305.hstgr.cloud:8000/health
```
