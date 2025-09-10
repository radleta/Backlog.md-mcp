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

program
	.name('backlog-mcp')
	.description('Backlog.md MCP Server - Integrate Backlog.md with MCP clients')
	.version(packageJson.version);

// Start command - runs the MCP server
program
	.command('start')
	.description('Start the Backlog.md MCP server')
	.option('-t, --transport <type>', 'Transport type (stdio or http)', 'stdio')
	.option('-p, --port <port>', 'Port for HTTP transport', '3000')
	.option('-v, --verbose', 'Enable verbose output')
	.action(async (options) => {
		// Import and start the server directly
		const { startServer } = await import('./server.js');
		
		// Don't log to stdout when using STDIO transport as it interferes with MCP protocol
		if (options.transport !== 'stdio') {
			console.log('Starting Backlog.md MCP server...');
		}
		
		// Pass arguments through process.argv for the server to parse
		if (options.transport === 'http') {
			process.argv.push('--http', '--port', options.port);
		}
		
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
			
			// Check if Backlog.md is accessible
			try {
				execSync('npx backlog --version', { stdio: 'ignore' });
				console.log('✅ Backlog.md CLI accessible');
			} catch {
				console.warn('⚠️  Backlog.md CLI not found globally');
				console.log('   The bundled version will be used');
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
https://github.com/radleta/backlog-md-mcp
		`));
	});

// Parse command line arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
	program.outputHelp();
}