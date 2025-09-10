#!/bin/bash

# Development convenience script for Backlog.md MCP Server
# This script provides easy access to the development version without global installation

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
DEV_BIN="$SCRIPT_DIR/package/bin/backlog-mcp-dev"

echo -e "${BLUE}🧪 Backlog.md MCP Server - Development Mode${NC}"
echo -e "${YELLOW}Using: $DEV_BIN${NC}"
echo ""

# Check if the development binary exists
if [ ! -f "$DEV_BIN" ]; then
    echo -e "${RED}❌ Development binary not found at: $DEV_BIN${NC}"
    echo -e "${YELLOW}Run './build.sh' first to build the project${NC}"
    exit 1
fi

# Pass all arguments to the development binary
node "$DEV_BIN" "$@"