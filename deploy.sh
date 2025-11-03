#!/bin/bash

# 🚀 Automated Deployment Script for Rule #1 Calculator
# This script will push to GitHub and provide Netlify deployment instructions

set -e  # Exit on any error

echo "🚀 Rule #1 Calculator - Automated Deployment"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get project directory
PROJECT_DIR="/Users/dSetia/Dropbox/projects/rule1-calculator"
cd "$PROJECT_DIR"

echo -e "${BLUE}📂 Working directory: $PROJECT_DIR${NC}"
echo ""

# Step 1: Git Setup
echo -e "${GREEN}Step 1: Setting up Git...${NC}"

# Check if git is initialized
if [ ! -d .git ]; then
    echo "Initializing Git repository..."
    git init
    echo "✅ Git initialized"
else
    echo "✅ Git already initialized"
fi

# Configure git if not set
if [ -z "$(git config user.name)" ]; then
    echo ""
    echo -e "${YELLOW}Git user not configured. Please enter your details:${NC}"
    read -p "Your name: " GIT_NAME
    read -p "Your email: " GIT_EMAIL
    git config user.name "$GIT_NAME"
    git config user.email "$GIT_EMAIL"
    echo "✅ Git configured"
fi

echo ""
echo -e "${GREEN}Step 2: Adding files to Git...${NC}"
git add .
echo "✅ Files added"

echo ""
echo -e "${GREEN}Step 3: Creating commit...${NC}"
git commit -m "Initial commit: Rule #1 Calculator with Fisher Analysis" || echo "⚠️  No changes to commit (already committed)"
echo "✅ Commit created"

echo ""
echo -e "${GREEN}Step 4: GitHub Repository Setup${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}ACTION REQUIRED: Create GitHub Repository${NC}"
echo ""
echo "1. Open this link in your browser:"
echo -e "   ${BLUE}https://github.com/new${NC}"
echo ""
echo "2. Fill in:"
echo "   • Repository name: rule1-calculator"
echo "   • Description: Phil Town's Rule #1 Investment Calculator with Fisher AI"
echo "   • Visibility: Public (or Private if you prefer)"
echo "   • ⚠️  Do NOT check 'Add a README file'"
echo "   • ⚠️  Do NOT add .gitignore or license"
echo ""
echo "3. Click 'Create repository'"
echo ""
read -p "Press ENTER when you've created the repository..."

echo ""
read -p "Enter your GitHub username: " GITHUB_USERNAME

REPO_URL="https://github.com/$GITHUB_USERNAME/rule1-calculator.git"

echo ""
echo -e "${GREEN}Step 5: Connecting to GitHub...${NC}"

# Check if remote already exists
if git remote | grep -q "origin"; then
    echo "Updating remote origin..."
    git remote set-url origin "$REPO_URL"
else
    echo "Adding remote origin..."
    git remote add origin "$REPO_URL"
fi
echo "✅ Remote configured: $REPO_URL"

echo ""
echo -e "${GREEN}Step 6: Pushing to GitHub...${NC}"
echo ""
echo -e "${YELLOW}You'll be asked to authenticate.${NC}"
echo "Use your GitHub username and a Personal Access Token (NOT your password)"
echo ""
echo "Don't have a token? Create one here:"
echo -e "${BLUE}https://github.com/settings/tokens/new${NC}"
echo "• Note: 'Netlify Deployment'"
echo "• Expiration: 90 days (or your preference)"
echo "• Scopes: Check 'repo' (Full control of private repositories)"
echo ""
read -p "Press ENTER to continue with push..."

git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Successfully pushed to GitHub!${NC}"
    echo ""
else
    echo ""
    echo -e "${YELLOW}⚠️  Push failed. Common issues:${NC}"
    echo "1. Authentication failed - Use a Personal Access Token, not password"
    echo "2. Repository doesn't exist - Make sure you created it on GitHub"
    echo "3. Repository name mismatch - Check the username/repo name"
    echo ""
    read -p "Press ENTER to continue anyway..."
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}Step 7: Netlify Deployment${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}ACTION REQUIRED: Deploy on Netlify${NC}"
echo ""
echo "1. Open Netlify and sign up with GitHub:"
echo -e "   ${BLUE}https://app.netlify.com/signup${NC}"
echo ""
echo "2. Click: 'Add new site' → 'Import an existing project'"
echo ""
echo "3. Choose: 'GitHub'"
echo ""
echo "4. Select repository: '$GITHUB_USERNAME/rule1-calculator'"
echo ""
echo "5. Configure build settings:"
echo "   • Build command: npm run build"
echo "   • Publish directory: dist"
echo ""
echo "6. Add environment variables (click 'Advanced'):"
echo "   • Key: VITE_ALPHA_VANTAGE_API_KEY"
echo "     Value: LH82CXE5Y5HTVXA4"
echo ""
echo "   • Key: VITE_GEMINI_API_KEY"
echo "     Value: AIzaSyBhZ0zrHFX5VMEvwvxT2uDjqun0ne-O7-Q"
echo ""
echo "7. Click: 'Deploy site'"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo ""
echo "Your site will be live in ~3 minutes at:"
echo "https://[random-name].netlify.app"
echo ""
echo "You can customize the domain in Netlify settings."
echo ""
echo -e "${BLUE}From now on, any 'git push' will auto-deploy! 🚀${NC}"
echo ""
read -p "Press ENTER to finish..."

echo ""
echo "✅ All done! Your app is ready for the world! 🌍"

