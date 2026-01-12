#!/bin/bash
# Test if requirements.txt installs correctly

echo "Testing backend requirements installation..."
cd backend

# Try installing requirements
pip install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "✅ Requirements install successfully"
else
    echo "❌ Requirements installation failed"
    exit 1
fi
