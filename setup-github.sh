#!/bin/bash

# Campus Desk GitHub Setup Script
# This script helps you upload the project to GitHub

echo "🚀 Campus Desk GitHub Setup"
echo "=============================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "client" ] || [ ! -d "server" ]; then
    echo "❌ Error: Please run this script from the Campus Desk root directory"
    exit 1
fi

# Get GitHub username
echo "Please enter your GitHub username:"
read -r GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo "❌ Error: GitHub username is required"
    exit 1
fi

# Repository name
REPO_NAME="campus-desk"
REPO_URL="https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

echo ""
echo "📋 Configuration:"
echo "   Username: $GITHUB_USERNAME"
echo "   Repository: $REPO_NAME"
echo "   URL: $REPO_URL"
echo ""

# Confirm
echo "Is this correct? (y/n)"
read -r CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "❌ Setup cancelled"
    exit 1
fi

echo ""
echo "🔧 Setting up GitHub repository..."

# Add remote origin
git remote add origin "$REPO_URL"

if [ $? -eq 0 ]; then
    echo "✅ Remote origin added successfully"
else
    echo "⚠️  Remote origin might already exist. Updating..."
    git remote set-url origin "$REPO_URL"
fi

echo ""
echo "📤 Ready to push to GitHub!"
echo ""
echo "Before pushing, make sure you have:"
echo "1. Created the repository on GitHub: https://github.com/new"
echo "2. Repository name: $REPO_NAME"
echo "3. Made it PUBLIC"
echo "4. NOT initialized with README/README"
echo ""
echo "Then run:"
echo "   git push -u origin master"
echo ""
echo "🎉 Setup complete!"
