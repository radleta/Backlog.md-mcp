#!/bin/bash

# Build script for Backlog.md MCP Server
# This script builds the TypeScript source and prepares the package for distribution

set -e

echo "🏗️  Building Backlog.md MCP Server..."

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm install

# Step 2: Build TypeScript
echo "🔨 Compiling TypeScript..."
npm run build

# Step 3: Run tests against built code
echo "🧪 Running tests..."
npm test

# Step 4: Lint and type check
echo "✨ Linting and type checking..."
npm run lint || true
npm run typecheck || true

# Step 5: Verify the build
echo "✅ Verifying build..."
if [ -f "dist/cli.js" ] && [ -f "dist/server.js" ] && [ -f "dist/index.js" ]; then
    echo "✨ Build successful!"
    echo "📁 Distribution ready in: dist/"
    echo ""
    echo "Development workflow:"
    echo "  ./dev.sh validate                    # Test development version"
    echo "  ./dev.sh start                       # Run development server"
    echo "  ./test-mcp.sh                        # Full integration test"
    echo ""
    echo "Production installation:"
    echo "  npm install -g .                     # Install for daily use"
    echo "  backlog-mcp validate                 # Verify installation"
    echo ""
    echo "To publish:"
    echo "  npm run release                      # Verify readiness"
    echo "  npm version [patch|minor|major]     # Auto-update changelog & push"
    echo "  npm publish                          # Auto-validate & publish"
else
    echo "❌ Build failed - missing expected files"
    exit 1
fi