#!/bin/bash
set -e

echo "🧹 Cleaning build artifacts..."

# Clean Swift build
if [ -d "swift-cli/.build" ]; then
    echo "Cleaning Swift build directory..."
    rm -rf swift-cli/.build
fi

# Clean TypeScript build
if [ -d "dist" ]; then
    echo "Cleaning TypeScript build directory..."
    rm -rf dist
fi

# Clean node_modules (optional)
if [ "$1" == "--all" ]; then
    if [ -d "node_modules" ]; then
        echo "Cleaning node_modules..."
        rm -rf node_modules
    fi
fi

echo "✅ Clean complete!"

