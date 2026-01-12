#!/bin/bash
echo "=== Backend Diagnostic Script ==="
echo ""
echo "1. Checking if backend is running..."
if ps aux | grep -v grep | grep uvicorn > /dev/null; then
    echo "✅ Backend process found"
    ps aux | grep -v grep | grep uvicorn
else
    echo "❌ Backend not running"
fi
echo ""
echo "2. Checking if port 8000 is listening..."
if command -v lsof > /dev/null; then
    if sudo lsof -i :8000 2>/dev/null; then
        echo "✅ Port 8000 is in use"
    else
        echo "❌ Port 8000 not in use"
    fi
elif command -v netstat > /dev/null; then
    if sudo netstat -tulpn | grep :8000 > /dev/null; then
        echo "✅ Port 8000 is listening"
        sudo netstat -tulpn | grep :8000
    else
        echo "❌ Port 8000 not listening"
    fi
else
    echo "⚠️  Cannot check port (lsof/netstat not available)"
fi
echo ""
echo "3. Testing health endpoint locally..."
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Health check passed"
    curl -s http://localhost:8000/health
else
    echo "❌ Health check failed"
fi
echo ""
echo "4. Checking firewall (UFW)..."
if command -v ufw > /dev/null; then
    if sudo ufw status | grep -q 8000; then
        echo "✅ Port 8000 allowed in firewall"
        sudo ufw status | grep 8000
    else
        echo "⚠️  Port 8000 not explicitly allowed (may still work)"
    fi
else
    echo "⚠️  UFW not installed, check firewall manually"
fi
echo ""
echo "5. Checking .env file..."
if [ -f .env ]; then
    echo "✅ .env exists"
    if grep -q "TAVILY_API_KEY" .env && grep -q "OLLAMA" .env; then
        echo "✅ Required environment variables found"
    else
        echo "⚠️  Some environment variables may be missing"
    fi
else
    echo "❌ .env file missing"
fi
echo ""
echo "6. Testing Ollama connection..."
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "✅ Ollama is accessible"
else
    echo "⚠️  Ollama not accessible (may not be needed for health check)"
fi
echo ""
echo "=== Diagnostic Complete ==="
