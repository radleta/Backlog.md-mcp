#!/usr/bin/env node

// Test script for MCP server
const { spawn } = require('child_process');
const readline = require('readline');

// Spawn the MCP server
const server = spawn('node', ['/home/ubuntu/Backlog.md-mcp/package/dist/cli.js', 'start', '--transport', 'stdio'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

// Create readline interface for reading responses
const rl = readline.createInterface({
  input: server.stdout,
  crlfDelay: Infinity
});

// Handle server output
rl.on('line', (line) => {
  console.log('Server response:', line);
  try {
    const response = JSON.parse(line);
    if (response.id === 1) {
      console.log('✓ Server initialized successfully!');
      
      // Now send a list tools request
      const listToolsRequest = {
        jsonrpc: '2.0',
        method: 'tools/list',
        params: {},
        id: 2
      };
      server.stdin.write(JSON.stringify(listToolsRequest) + '\n');
    } else if (response.id === 2) {
      console.log('✓ Tools listed successfully!');
      console.log('Available tools:', response.result.tools.map(t => t.name).join(', '));
      process.exit(0);
    }
  } catch (e) {
    // Not JSON, ignore
  }
});

// Handle errors
server.stderr.on('data', (data) => {
  console.error('Server error:', data.toString());
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

// Send initialize request
const initRequest = {
  jsonrpc: '2.0',
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: {
      name: 'test-client',
      version: '1.0.0'
    }
  },
  id: 1
};

setTimeout(() => {
  console.log('Sending initialize request...');
  server.stdin.write(JSON.stringify(initRequest) + '\n');
}, 100);

// Timeout after 5 seconds
setTimeout(() => {
  console.error('Test timed out');
  server.kill();
  process.exit(1);
}, 5000);