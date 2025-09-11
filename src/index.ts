/**
 * Backlog.md MCP Server
 * 
 * Main entry point for the npm package
 */

export { default as server } from './server';
export * from './config';

// Re-export MCP types for convenience
export { Server } from '@modelcontextprotocol/sdk/server/index.js';
export { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';