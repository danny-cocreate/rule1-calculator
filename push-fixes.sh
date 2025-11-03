#!/bin/bash

# Quick script to push TypeScript fixes

cd /Users/dSetia/Dropbox/projects/rule1-calculator

echo "🔧 Pushing TypeScript fixes..."

git add .
git commit -m "Fix TypeScript errors for deployment"
git push

echo "✅ Fixes pushed to GitHub!"
echo "🚀 Netlify will auto-deploy in ~3 minutes!"

