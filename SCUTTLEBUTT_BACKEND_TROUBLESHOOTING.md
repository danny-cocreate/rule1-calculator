# Scuttlebutt Backend Connection Troubleshooting

## Problem
Frontend is getting `ERR_CONNECTION_TIMED_OUT` when trying to connect to:
`https://srv999305.hstgr.cloud:8000/fisher-research`

## Possible Issues

1. **Backend not running** - The FastAPI backend might not be running on the VPS
2. **Wrong port** - Port 8000 might not be exposed/accessible
3. **Firewall/Network** - Port 8000 might be blocked
4. **HTTPS vs HTTP** - Using HTTPS on port 8000 might be incorrect (usually HTTP)
5. **URL incorrect** - The backend URL might need to be different

## Quick Checks

1. **Verify backend is running on VPS:**
   ```bash
   # SSH into VPS and check if backend is running
   ps aux | grep uvicorn
   # Or check if port 8000 is listening
   netstat -tulpn | grep 8000
   ```

2. **Test backend directly:**
   ```bash
   curl https://srv999305.hstgr.cloud:8000/health
   # Or try HTTP instead of HTTPS
   curl http://srv999305.hstgr.cloud:8000/health
   ```

3. **Check Netlify environment variable:**
   - Go to Netlify dashboard
   - Site settings → Environment variables
   - Verify `VITE_SCUTTLEBUTT_API_URL` is set correctly

## Solutions

### Option 1: Use HTTP instead of HTTPS
If the backend doesn't have SSL, use:
```
http://srv999305.hstgr.cloud:8000
```

### Option 2: Use a reverse proxy (nginx)
If you have nginx, proxy port 8000 to a standard HTTPS port:
```
https://srv999305.hstgr.cloud/api
```

### Option 3: Make backend optional (graceful degradation)
If backend is unavailable, show a message but don't break the app.
