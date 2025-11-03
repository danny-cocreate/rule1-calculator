#!/bin/bash

# Check what's in Git and push everything including Fisher/Gemini files

cd /Users/dSetia/Dropbox/projects/rule1-calculator

echo "🔍 Checking Git status..."
echo "================================"
echo ""

git status

echo ""
echo "================================"
echo "📦 Key Fisher/Gemini Files:"
echo "================================"
echo ""

# Check if key files exist
FILES=(
    "src/types/fisher.ts"
    "src/services/geminiService.ts"
    "src/utils/fisherCalculations.ts"
    "src/components/FisherScorecard.tsx"
    "src/components/FisherScorecard.css"
    "src/vite-env.d.ts"
    "package.json"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ MISSING: $file"
    fi
done

echo ""
echo "================================"
echo "📤 Adding all files to Git..."
echo "================================"
echo ""

# Add all files
git add .

# Show what will be committed
echo ""
echo "Files to be committed:"
git status --short

echo ""
read -p "Commit and push these files? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    git commit -m "Fix TypeScript errors and ensure all Fisher/Gemini files are included"
    git push
    
    echo ""
    echo "✅ All files pushed to GitHub!"
    echo "🚀 Netlify will auto-deploy in ~3 minutes!"
    echo ""
    echo "Your site: https://app.netlify.com/"
else
    echo "❌ Push cancelled"
fi

