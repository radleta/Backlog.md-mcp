#!/usr/bin/env node

// Test script to see what environment variables are available to MCP servers
console.log('Environment variables available to MCP server:');
console.log('=====================================');
console.log('CWD:', process.cwd());
console.log('PWD:', process.env.PWD);
console.log('HOME:', process.env.HOME);
console.log('USER:', process.env.USER);
console.log('');
console.log('All environment variables:');
Object.keys(process.env).sort().forEach(key => {
  if (key.includes('CLAUDE') || key.includes('MCP') || key.includes('PROJECT') || key.includes('WORK')) {
    console.log(`${key}: ${process.env[key]}`);
  }
});