#!/bin/bash

# GitHub Pages Deployment Script for Campus Desk Frontend

echo "🚀 Deploying Campus Desk to GitHub Pages..."

# Build the React app
echo "📦 Building React app..."
cd client
npm run build

# Install gh-pages if not already installed
if ! npm list -g gh-pages > /dev/null 2>&1; then
    echo "📦 Installing gh-pages..."
    npm install -g gh-pages
fi

# Deploy to GitHub Pages
echo "🌐 Deploying to GitHub Pages..."
npx gh-pages -d build -m "Deploy Campus Desk to GitHub Pages"

echo "✅ Deployment complete!"
echo "🌍 Your app is now live at: https://yourusername.github.io/campus-desk"
