#!/bin/bash

# Test script for Backlog.md MCP Server development
# Tests the MCP server functionality locally without affecting production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

echo -e "${BLUE}🧪 Testing Backlog.md MCP Server (Development Version)${NC}"
echo ""

# Step 1: Build the project
echo -e "${YELLOW}Step 1: Building project...${NC}"
if ! "$SCRIPT_DIR/build.sh" > /tmp/build.log 2>&1; then
    echo -e "${RED}❌ Build failed. Check /tmp/build.log for details${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build successful${NC}"

# Step 2: Test validation
echo -e "${YELLOW}Step 2: Testing validation...${NC}"
if "$SCRIPT_DIR/dev.sh" validate > /tmp/validate.log 2>&1; then
    echo -e "${GREEN}✅ Validation passed${NC}"
else
    echo -e "${RED}❌ Validation failed. Check /tmp/validate.log for details${NC}"
    cat /tmp/validate.log
    exit 1
fi

# Step 3: Test server can import and initialize
echo -e "${YELLOW}Step 3: Testing server initialization...${NC}"
if timeout 3s node -e "
import('$SCRIPT_DIR/package/dist/server.js')
  .then(() => console.log('Server module loaded successfully'))
  .catch(e => { console.error('Server failed to load:', e.message); process.exit(1); })
" > /tmp/server.log 2>&1; then
    echo -e "${GREEN}✅ Server initialization successful${NC}"
else
    echo -e "${RED}❌ Server initialization failed. Check /tmp/server.log for details${NC}"
    cat /tmp/server.log
    exit 1
fi

# Step 4: Show usage information
echo ""
echo -e "${GREEN}🎉 All tests passed!${NC}"
echo ""
echo -e "${BLUE}Usage Instructions:${NC}"
echo -e "  ${YELLOW}Development:${NC}     ./dev.sh validate"
echo -e "  ${YELLOW}Start Server:${NC}    ./dev.sh start"
echo -e "  ${YELLOW}With Claude:${NC}     claude mcp add backlog-md-dev -- node $SCRIPT_DIR/package/bin/backlog-mcp-dev start"
echo ""
echo -e "${BLUE}Install for Production Use:${NC}"
echo -e "  cd package && npm install -g ."
echo -e "  claude mcp add backlog-md -- backlog-mcp start"