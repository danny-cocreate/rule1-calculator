#!/bin/bash

# 🚀 Create GitHub Repo and Push - All From Terminal
# This script creates the GitHub repository via API and pushes your code

set -e

echo "🚀 Creating GitHub Repository from Terminal"
echo "==========================================="
echo ""

cd /Users/dSetia/Dropbox/projects/rule1-calculator

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

GITHUB_USERNAME="danny-cocreate"
REPO_NAME="rule1-calculator"

echo -e "${BLUE}Username: $GITHUB_USERNAME${NC}"
echo -e "${BLUE}Repository: $REPO_NAME${NC}"
echo ""

# Check if GitHub CLI is installed
if command -v gh &> /dev/null; then
    echo -e "${GREEN}✅ GitHub CLI found! Using gh command...${NC}"
    echo ""
    
    # Check if authenticated
    if gh auth status &> /dev/null; then
        echo -e "${GREEN}✅ Already authenticated with GitHub${NC}"
    else
        echo -e "${YELLOW}Please authenticate with GitHub:${NC}"
        gh auth login
    fi
    
    echo ""
    echo -e "${GREEN}Creating repository on GitHub...${NC}"
    gh repo create "$REPO_NAME" --public --source=. --remote=origin --push
    
    echo ""
    echo -e "${GREEN}✅ Repository created and code pushed!${NC}"
    echo -e "${BLUE}View your repo: https://github.com/$GITHUB_USERNAME/$REPO_NAME${NC}"
    
else
    echo -e "${YELLOW}GitHub CLI not found. Using API method...${NC}"
    echo ""
    echo -e "${YELLOW}You'll need a Personal Access Token.${NC}"
    echo "Create one here: ${BLUE}https://github.com/settings/tokens/new${NC}"
    echo "Scopes needed: ✅ repo"
    echo ""
    read -p "Paste your Personal Access Token: " GITHUB_TOKEN
    
    if [ -z "$GITHUB_TOKEN" ]; then
        echo -e "${RED}❌ Token is required!${NC}"
        exit 1
    fi
    
    echo ""
    echo -e "${GREEN}Creating repository on GitHub via API...${NC}"
    
    # Create repo via GitHub API
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        https://api.github.com/user/repos \
        -d "{
            \"name\": \"$REPO_NAME\",
            \"description\": \"Phil Town's Rule #1 Investment Calculator with Philip Fisher AI Analysis\",
            \"private\": false,
            \"auto_init\": false
        }")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" = "201" ]; then
        echo -e "${GREEN}✅ Repository created successfully!${NC}"
        echo ""
        
        # Configure remote
        echo -e "${GREEN}Configuring git remote...${NC}"
        if git remote get-url origin &> /dev/null; then
            git remote set-url origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
        else
            git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
        fi
        
        echo -e "${GREEN}Pushing code to GitHub...${NC}"
        echo ""
        echo "You'll need to authenticate:"
        echo "Username: $GITHUB_USERNAME"
        echo "Password: (paste your token)"
        echo ""
        
        git push -u origin main
        
        if [ $? -eq 0 ]; then
            echo ""
            echo -e "${GREEN}✅ Successfully pushed to GitHub!${NC}"
            echo -e "${BLUE}View your repo: https://github.com/$GITHUB_USERNAME/$REPO_NAME${NC}"
        else
            echo ""
            echo -e "${RED}❌ Push failed. Try running manually:${NC}"
            echo "git push -u origin main"
        fi
        
    elif [ "$HTTP_CODE" = "422" ]; then
        echo -e "${YELLOW}⚠️  Repository already exists!${NC}"
        echo "Attempting to push anyway..."
        echo ""
        
        # Configure remote
        if git remote get-url origin &> /dev/null; then
            git remote set-url origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
        else
            git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
        fi
        
        git push -u origin main
        
    else
        echo -e "${RED}❌ Failed to create repository${NC}"
        echo "HTTP Code: $HTTP_CODE"
        echo "Response: $BODY"
        echo ""
        echo "Common issues:"
        echo "1. Invalid token - Create a new one with 'repo' scope"
        echo "2. Token expired - Generate a new token"
        echo "3. Repository already exists - Delete it first or use different name"
        exit 1
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 GitHub Setup Complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next: Deploy to Netlify"
echo ""
echo "1. Go to: ${BLUE}https://app.netlify.com/signup${NC}"
echo "2. Sign up with GitHub"
echo "3. Click: 'Add new site' → 'Import an existing project'"
echo "4. Select: 'GitHub' → '$REPO_NAME'"
echo "5. Configure:"
echo "   • Build command: npm run build"
echo "   • Publish directory: dist"
echo "6. Add environment variables:"
echo "   • VITE_STOCKDATA_API_KEY = your_stockdata_api_key_here"
echo "   • VITE_GEMINI_API_KEY = AIzaSyBhZ0zrHFX5VMEvwvxT2uDjqun0ne-O7-Q"
echo "7. Click 'Deploy site'"
echo ""
echo -e "${GREEN}Your site will be live in ~3 minutes! 🚀${NC}"
echo ""

