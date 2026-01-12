#!/bin/bash
# VPS Deployment Script for Fisher Research API
# This script sets up the backend on your VPS with systemd service

set -e

echo "🚀 Fisher Research API - VPS Deployment"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if running as root for systemd setup
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}Error: Don't run this script as root. Run as your user, it will ask for sudo when needed.${NC}"
   exit 1
fi

echo "📋 Step 1: Checking prerequisites..."
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 not found. Please install Python 3.8+${NC}"
    exit 1
fi
PYTHON_VERSION=$(python3 --version)
echo -e "${GREEN}✅ Found: $PYTHON_VERSION${NC}"

# Check pip
if ! command -v pip3 &> /dev/null; then
    echo -e "${RED}❌ pip3 not found. Installing...${NC}"
    sudo apt-get update && sudo apt-get install -y python3-pip
fi
echo -e "${GREEN}✅ pip3 available${NC}"

echo ""
echo "📦 Step 2: Installing Python dependencies..."
echo ""

cd backend
pip3 install --user -r requirements.txt
cd ..

echo -e "${GREEN}✅ Dependencies installed${NC}"

echo ""
echo "📝 Step 3: Setting up environment variables..."
echo ""

if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << 'EOF'
# OpenRouter (for Scuttlebutt research)
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=openai/gpt-4o-mini

# Tavily (for web search)
TAVILY_API_KEY=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

# SEC EDGAR (for ROE calculation)
SEC_USER_AGENT=Rule1Calculator your@email.com

# Backend settings
PORT=8000
EOF
    echo -e "${YELLOW}⚠️  Created .env file. Please edit it with your API keys!${NC}"
    echo "   Run: nano .env"
    echo ""
    read -p "Press Enter after you've updated .env file..."
else
    echo -e "${GREEN}✅ .env file exists${NC}"
fi

echo ""
echo "🔧 Step 4: Creating systemd service..."
echo ""

# Get current user and working directory
CURRENT_USER=$(whoami)
WORK_DIR=$(pwd)
PYTHON_PATH=$(which python3)

# Create systemd service file
SERVICE_FILE="/tmp/fisher-api.service"
cat > "$SERVICE_FILE" << EOF
[Unit]
Description=Fisher Research API
After=network.target

[Service]
Type=simple
User=$CURRENT_USER
WorkingDirectory=$WORK_DIR
Environment="PATH=/usr/bin:/usr/local/bin"
EnvironmentFile=$WORK_DIR/.env
ExecStart=$PYTHON_PATH -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

echo "Service file created at: $SERVICE_FILE"
echo ""
echo "Installing systemd service..."
sudo cp "$SERVICE_FILE" /etc/systemd/system/fisher-api.service
sudo systemctl daemon-reload
sudo systemctl enable fisher-api

echo -e "${GREEN}✅ Systemd service created and enabled${NC}"

echo ""
echo "🔥 Step 5: Configuring firewall..."
echo ""

if command -v ufw &> /dev/null; then
    sudo ufw allow 8000/tcp
    echo -e "${GREEN}✅ Firewall rule added (port 8000)${NC}"
else
    echo -e "${YELLOW}⚠️  ufw not found. Please manually allow port 8000 in your firewall${NC}"
fi

echo ""
echo "🚀 Step 6: Starting service..."
echo ""

sudo systemctl start fisher-api
sleep 2
sudo systemctl status fisher-api --no-pager

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo "📊 Service Status:"
echo "   Check: sudo systemctl status fisher-api"
echo "   Logs:  sudo journalctl -u fisher-api -f"
echo "   Stop:  sudo systemctl stop fisher-api"
echo "   Start: sudo systemctl start fisher-api"
echo ""
echo "🌐 API Endpoints:"
echo "   Health: http://$(hostname -I | awk '{print $1}'):8000/health"
echo "   Docs:   http://$(hostname -I | awk '{print $1}'):8000/docs"
echo "   ROE:    http://$(hostname -I | awk '{print $1}'):8000/fisher-research/yahoo-roe/NVDA"
echo ""
echo "📝 Next Steps:"
echo "   1. Update Netlify environment variable:"
echo "      VITE_SCUTTLEBUTT_API_URL=http://$(hostname -I | awk '{print $1}'):8000"
echo "   2. Test the API: curl http://$(hostname -I | awk '{print $1}'):8000/health"
echo ""
