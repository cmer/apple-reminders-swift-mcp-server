#!/bin/bash
set -e

echo "🚀 Setting up Apple Reminders MCP Server..."
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check for Swift
if ! command -v swift &> /dev/null; then
    echo "❌ Swift is not installed. Please install Xcode Command Line Tools."
    exit 1
fi

echo "📦 Installing Node.js dependencies..."
npm install

echo ""
echo "🔨 Building Swift CLI..."
./scripts/build-swift-cli.sh

echo ""
echo "📝 Building TypeScript..."
npm run build

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Request EventKit permissions:"
echo "     ./swift-cli/.build/release/reminders-cli request-access"
echo ""
echo "  2. Test the MCP server:"
echo "     npm run dev"
echo ""
echo "  3. Add to Claude Desktop config (~/.config/claude/claude_desktop_config.json):"
echo '     {'
echo '       "mcpServers": {'
echo '         "apple-reminders": {'
echo '           "command": "node",'
echo '           "args": ["'$(pwd)'/dist/index.js"]'
echo '         }'
echo '       }'
echo '     }'
echo ""

