# Backend Connection Fix

## Problem
Frontend is getting `ERR_CONNECTION_TIMED_OUT` when trying to connect to the Scuttlebutt backend at:
`https://srv999305.hstgr.cloud:8000/fisher-research`

## Changes Made

1. **Better Error Handling** - Added specific error messages for connection issues
2. **Graceful Degradation** - App still shows quantitative analysis even if backend is unavailable
3. **Configuration Check** - Warns if backend URL is not configured

## Solutions

### Option 1: Check Backend is Running (Recommended)

SSH into your VPS and verify:

```bash
# Check if backend process is running
ps aux | grep uvicorn

# Check if port 8000 is listening
netstat -tulpn | grep 8000
# Or
lsof -i :8000

# Test backend directly
curl http://srv999305.hstgr.cloud:8000/health
```

If not running, start it:
```bash
cd /path/to/rule1-calculator
python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

### Option 2: Use HTTP Instead of HTTPS

Port 8000 typically uses HTTP, not HTTPS. Update Netlify environment variable:

**In Netlify Dashboard:**
- Go to Site settings → Environment variables
- Update `VITE_SCUTTLEBUTT_API_URL` to: `http://srv999305.hstgr.cloud:8000`
- Trigger a new deploy

### Option 3: Check Firewall

Make sure port 8000 is open:

```bash
# UFW (Ubuntu)
sudo ufw allow 8000/tcp

# firewalld (CentOS/RHEL)
sudo firewall-cmd --add-port=8000/tcp --permanent
sudo firewall-cmd --reload
```

### Option 4: Use Reverse Proxy (Best for Production)

Set up nginx to proxy port 8000 to a standard HTTPS port:

```nginx
server {
    listen 443 ssl;
    server_name api.srv999305.hstgr.cloud;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Then update `VITE_SCUTTLEBUTT_API_URL` to: `https://api.srv999305.hstgr.cloud`

## Current Behavior

- ✅ App still works for quantitative analysis (FMP data)
- ⚠️ Shows error message if backend is unavailable
- ✅ Graceful degradation - doesn't break the app

## Next Steps

1. Verify backend is running on VPS
2. Check port 8000 is accessible
3. Update Netlify environment variable if needed (HTTP vs HTTPS)
4. Test connection: `curl http://srv999305.hstgr.cloud:8000/health`
