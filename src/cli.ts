#!/usr/bin/env node

/**
 * Backlog.md MCP Server CLI Implementation
 * This is the TypeScript source that gets compiled to dist/cli.js
 */

import { program } from 'commander';
import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import * as config from './config.js';
import chalk from 'chalk';

// Get package version - ES module workaround for __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(
	fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8')
);

// Detect development mode
const isDevelopment = process.env.BACKLOG_ENV === 'development';
const programName = isDevelopment ? 'backlog-mcp-dev' : 'backlog-mcp';
const programDescription = isDevelopment 
	? 'Backlog.md MCP Server (Development Mode) - Integrate Backlog.md with MCP clients'
	: 'Backlog.md MCP Server - Integrate Backlog.md with MCP clients';

program
	.name(programName)
	.description(programDescription)
	.version(packageJson.version);

// Start command - runs the MCP server
program
	.command('start')
	.description('Start the Backlog.md MCP server')
	.option('-v, --verbose', 'Enable verbose output')
	.action(async (options) => {
		// Import and start the server directly
		const { startServer } = await import('./server.js');
		
		// Pass arguments through process.argv for the server to parse
		if (options.verbose) {
			process.argv.push('--verbose');
		}
		
		try {
			await startServer();
		} catch (error: any) {
			console.error('Failed to start server:', error);
			process.exit(1);
		}
	});


// Config command - manage configuration
program
	.command('config')
	.description('Manage Backlog.md MCP configuration')
	.argument('[action]', 'Action to perform (show, set, get)')
	.argument('[key]', 'Configuration key')
	.argument('[value]', 'Configuration value')
	.action(async (action, key, value) => {
		try {
			switch (action) {
				case 'show': {
					const allConfig = await config.getAll();
					console.log(JSON.stringify(allConfig, null, 2));
					break;
				}
				
				case 'get': {
					if (!key) {
						console.error('Key required for get action');
						process.exit(1);
					}
					const val = await config.get(key);
					console.log(val);
					break;
				}
				
				case 'set': {
					if (!key || !value) {
						console.error('Key and value required for set action');
						process.exit(1);
					}
					await config.set(key, value);
					console.log(`Set ${key} = ${value}`);
					break;
				}
				
				default:
					console.error('Invalid action. Use: show, get, or set');
					process.exit(1);
			}
		} catch (error: any) {
			console.error('Config operation failed:', error.message);
			process.exit(1);
		}
	});

// Validate command - checks if setup is correct
program
	.command('validate')
	.description('Validate Backlog.md MCP server setup')
	.action(async () => {
		try {
			console.log('Validating Backlog.md MCP setup...\n');
			
			// Show mode information
			if (isDevelopment) {
				console.log(chalk.yellow('🧪 Running in DEVELOPMENT mode'));
				console.log(chalk.gray(`   Config directory: ${process.env.BACKLOG_CONFIG_DIR || '~/.config/backlog-mcp-dev'}`));
				console.log('');
			}
			
			// Check if Backlog.md is initialized
			if (!config.isBacklogInitialized()) {
				console.error('❌ Backlog.md is not initialized in the current directory');
				console.log('Run "backlog init" to initialize your project first');
				process.exit(1);
			}
			
			console.log('✅ Backlog.md is initialized');
			
			// Test if the server can start
			try {
				await import('./server.js');
				console.log('✅ MCP server can start successfully');
			} catch (error: any) {
				console.error('❌ MCP server failed to start:', error.message);
				process.exit(1);
			}
			
			// Test backlog CLI path detection
			try {
				const backlogPath = await config.getBacklogCliPath();
				console.log(`✅ Backlog.md CLI found at: ${backlogPath}`);
				
				// Test if the CLI actually works
				try {
					execSync(`"${backlogPath}" --version`, { stdio: 'ignore' });
					console.log('✅ Backlog.md CLI responds correctly');
				} catch (error: any) {
					console.error(`❌ Backlog.md CLI found but not working: ${error.message}`);
					console.log('   Try running manually to diagnose the issue');
				}
			} catch (error: any) {
				console.error('❌ Backlog.md CLI not found');
				console.log('   Install with: npm install -g backlog.md');
				console.log('   Or configure path: backlog-mcp config set backlogCliPath "/path/to/backlog"');
				process.exit(1);
			}
			
			console.log('\n✨ Setup validated successfully!');
			console.log('\nFor Claude Code, run:');
			console.log('  claude mcp add backlog-md -- backlog-mcp start');
			
		} catch (error: any) {
			console.error('Validation failed:', error.message);
			process.exit(1);
		}
	});

// Info command - shows information about the installation
program
	.command('info')
	.description('Show information about the MCP server')
	.action(() => {
		console.log(chalk.blue(`
Backlog.md MCP Server v${packageJson.version}
================================

This server integrates Backlog.md task management with MCP clients
using the Model Context Protocol (MCP).

Available Tools:
- task_create    Create new tasks
- task_list      List and filter tasks
- task_edit      Edit existing tasks
- task_move      Move tasks between columns
- task_delete    Delete tasks
- board_show     Display Kanban board
- sprint_create  Create new sprints
- sprint_current Show current sprint
- config_get     Get configuration values
- config_set     Set configuration values

Resources:
- backlog://tasks/all       All tasks
- backlog://board          Kanban board
- backlog://config         Configuration
- backlog://sprint/current Current sprint

For more information, visit:
https://github.com/radleta/Backlog.md-mcp
		`));
	});

// Detect command - helps diagnose path issues
program
	.command('detect')
	.description('Detect and show Backlog.md CLI installation paths')
	.action(async () => {
		console.log('Detecting Backlog.md CLI installations...\n');
		
		try {
			const detectedPath = await config.getBacklogCliPath();
			console.log(`Current configured/detected path: ${detectedPath}`);
			
			// Show current config
			const customPath = await config.get('backlogCliPath');
			if (customPath) {
				console.log(`Configured custom path: ${customPath}`);
			} else {
				console.log('No custom path configured (using auto-detection)');
			}
			
			// Test the detected path
			if (fs.existsSync(detectedPath)) {
				console.log('✅ Path exists');
				
				try {
					const version = execSync(`"${detectedPath}" --version`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
					console.log(`✅ CLI responds: ${version.trim()}`);
				} catch (error: any) {
					console.error('❌ CLI does not respond properly');
				}
			} else {
				console.error('❌ Path does not exist');
			}
			
		} catch (error: any) {
			console.error('Error during detection:', error.message);
		}
	});

// Parse command line arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
	program.outputHelp();
}