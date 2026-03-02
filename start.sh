#!/bin/bash
# Quick Start Script for Time Pass Game

echo "🎮 Time Pass Game - Quick Start"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "✅ Dependencies installed successfully!"
echo ""
echo "🚀 Starting development server..."
echo "   The game will open at http://localhost:3000"
echo ""
echo "📝 Controls:"
echo "   - Move finger left/right to switch lanes"
echo "   - Move finger up to jump"
echo "   - Avoid obstacles and get the highest score!"
echo ""

npm run dev
