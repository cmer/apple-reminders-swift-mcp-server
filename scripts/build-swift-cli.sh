#!/bin/bash
set -e

echo "🔨 Building Swift CLI..."
cd "$(dirname "$0")/../swift-cli"

# Build in release mode for better performance
swift build --configuration release

echo "✅ Swift CLI built successfully!"
echo "Binary location: .build/release/reminders-cli"

