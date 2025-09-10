#!/usr/bin/env node

/**
 * Backlog.md MCP Server CLI Entry Point - DEVELOPMENT VERSION
 * 
 * This is the development wrapper that loads the compiled CLI from dist/
 * with development-specific environment settings to avoid conflicts
 * with the production installation.
 */

// Set development environment variables before importing
process.env.BACKLOG_ENV = 'development';
process.env.BACKLOG_CONFIG_DIR = process.env.HOME + '/.config/backlog-mcp-dev';
process.env.BACKLOG_DEV_MODE = 'true';

import '../dist/cli.js';