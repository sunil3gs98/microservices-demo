#!/bin/bash

# GitHub Branch File Search - Quick Start Script

echo "🚀 GitHub Branch File Search - Setup"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+"
    exit 1
fi

echo "✅ Node.js $(node --version) detected"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example"
    cp .env.example .env
    echo ""
    echo "⚠️  Please edit .env and add your GITHUB_TOKEN:"
    echo "   1. Go to https://github.com/settings/tokens/new"
    echo "   2. Create a new token with 'repo' scope"
    echo "   3. Copy the token and paste in .env"
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo ""

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build
echo ""

echo "✅ Setup complete!"
echo "Run 'npm start' to begin searching"
