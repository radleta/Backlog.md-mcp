#!/usr/bin/env node

/**
 * Post-install script for Backlog.md MCP Server
 * 
 * This script runs after npm install to help users set up the integration
 */

import { existsSync } from 'fs';
import path from 'path';
import os from 'os';

console.log('\n🎉 Backlog.md MCP Server installed successfully!\n');

// Check if this is a global installation
const isGlobal = process.env.npm_config_global === 'true';

if (isGlobal) {
	console.log('✓ Installed globally');
	console.log('\nNext steps:');
	console.log('  1. Run "backlog-mcp setup" to configure Claude Desktop');
	console.log('  2. Restart Claude Desktop');
	console.log('  3. Start using Backlog.md commands in Claude!\n');
	
	// Check if Claude Desktop is installed
	const platform = process.platform;
	let claudePath;
	
	switch (platform) {
		case 'darwin': // macOS
			claudePath = path.join(
				os.homedir(),
				'Library',
				'Application Support',
				'Claude'
			);
			break;
			
		case 'win32': // Windows
			claudePath = path.join(
				process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'),
				'Claude'
			);
			break;
			
		case 'linux':
			claudePath = path.join(
				os.homedir(),
				'.config',
				'claude'
			);
			break;
	}
	
	if (claudePath && !existsSync(claudePath)) {
		console.log('⚠  Claude Desktop not detected');
		console.log('   Please install Claude Desktop from: https://claude.ai/download\n');
	} else if (claudePath) {
		console.log('✓ Claude Desktop detected');
		console.log(`   Config location: ${claudePath}\n`);
	}
	
	// Show available commands
	console.log('Available commands:');
	console.log('  backlog-mcp setup    - Configure Claude Desktop integration');
	console.log('  backlog-mcp validate - Test the setup');
	console.log('  backlog-mcp info     - Show server information');
	console.log('  backlog-mcp start    - Start the server manually');
	console.log('  backlog-mcp --help   - Show all commands\n');
	
} else {
	// Local installation
	console.log('ℹ  Installed locally');
	console.log('   For global installation and CLI access, run:');
	console.log('   npm install -g @radleta/backlog-md-mcp\n');
}

// Show documentation links
console.log('📚 Documentation:');
console.log('   GitHub: https://github.com/radleta/backlog-md-mcp');
console.log('   Issues: https://github.com/radleta/backlog-md-mcp/issues\n');