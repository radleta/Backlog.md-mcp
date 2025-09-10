#!/bin/bash

# Build script for Backlog.md MCP Server
# This script builds the TypeScript source and prepares the package for distribution

set -e

echo "🏗️  Building Backlog.md MCP Server..."

# Step 1: Install dependencies in source
echo "📦 Installing build dependencies..."
cd source
npm install

# Step 2: Build TypeScript first
echo "🔨 Compiling TypeScript..."
npm run build

# Step 3: Install runtime dependencies in package
echo "📦 Installing runtime dependencies..."
cd ../package
npm install --production

# Step 4: Run tests against built code (after package is fully assembled)
echo "🧪 Running tests..."
cd ../source
npm test

# Step 5: Lint and type check
echo "✨ Linting and type checking..."
npm run lint || true
npm run typecheck || true

# Step 6: Verify the build
echo "✅ Verifying build..."
cd ../package
if [ -f "dist/cli.js" ] && [ -f "dist/server.js" ] && [ -f "dist/index.js" ]; then
    echo "✨ Build successful!"
    echo "📁 Distribution package ready in: package/"
    echo ""
    echo "To test locally:"
    echo "  cd package && npm link"
    echo "  backlog-mcp --help"
    echo ""
    echo "To publish:"
    echo "  cd package && npm publish"
else
    echo "❌ Build failed - missing expected files"
    exit 1
fi