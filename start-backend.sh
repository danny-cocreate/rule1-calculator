#!/bin/bash
# Start FastAPI Backend on VPS
# Run this to start the backend server

echo "🚀 Starting Fisher Research Backend..."
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Run setup-vps.sh first."
    exit 1
fi

# Check if dependencies are installed
if ! python3 -c "import fastapi" 2>/dev/null; then
    echo "❌ FastAPI not installed. Run setup-vps.sh first."
    exit 1
fi

# Check if Ollama is accessible
if ! curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "⚠️  Warning: Ollama not accessible at http://localhost:11434"
    echo "   The backend will start, but research will fail if Ollama is not running."
    echo ""
fi

echo "Starting FastAPI backend on http://0.0.0.0:8000"
echo "API docs will be available at http://localhost:8000/docs"
echo "Health check: http://localhost:8000/health"
echo ""
echo "Press CTRL+C to stop the server"
echo ""

# Start backend
python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
