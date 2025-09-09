#!/usr/bin/env node

/**
 * Backlog.md MCP Server CLI Implementation
 * This is the TypeScript source that gets compiled to dist/cli.js
 */

import { program } from 'commander';
import { spawn, execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { runSetupWizard } from './setup';
import * as config from './config';
import chalk from 'chalk';

// Get package version
const packageJson = JSON.parse(
	fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8')
);

program
	.name('backlog-mcp')
	.description('Backlog.md MCP Server - Integrate Backlog.md with Claude Desktop')
	.version(packageJson.version);

// Start command - runs the MCP server
program
	.command('start')
	.description('Start the Backlog.md MCP server')
	.option('-t, --transport <type>', 'Transport type (stdio or http)', 'stdio')
	.option('-p, --port <port>', 'Port for HTTP transport', '3000')
	.option('-v, --verbose', 'Enable verbose output')
	.action((options) => {
		console.log('Starting Backlog.md MCP server...');
		
		const serverPath = path.join(__dirname, 'server.js');
		const args: string[] = [];
		
		if (options.transport === 'http') {
			args.push('--http', '--port', options.port);
		}
		
		if (options.verbose) {
			args.push('--verbose');
		}
		
		const child = spawn('node', [serverPath, ...args], {
			stdio: options.transport === 'stdio' ? 'inherit' : 'pipe'
		});
		
		if (options.transport === 'http') {
			console.log(`MCP server running on http://localhost:${options.port}`);
			
			child.stdout?.on('data', (data) => {
				if (options.verbose) {
					console.log(data.toString());
				}
			});
			
			child.stderr?.on('data', (data) => {
				console.error(data.toString());
			});
		}
		
		child.on('error', (err) => {
			console.error('Failed to start server:', err);
			process.exit(1);
		});
		
		child.on('exit', (code) => {
			if (code !== 0) {
				console.error(`Server exited with code ${code}`);
				process.exit(code || 1);
			}
		});
	});

// Setup command - configures Claude Desktop integration
program
	.command('setup')
	.description('Set up Claude Desktop integration')
	.option('-f, --force', 'Force reconfiguration even if already set up')
	.option('-p, --path <path>', 'Custom path to Claude Desktop config')
	.action(async (options) => {
		try {
			await runSetupWizard(options);
		} catch (error: any) {
			console.error('Setup failed:', error.message);
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
	.description('Validate Claude Desktop integration')
	.action(async () => {
		try {
			console.log('Validating Backlog.md MCP setup...\n');
			
			// Check if Claude Desktop config exists
			const claudeConfig = await config.getClaudeConfig();
			if (!claudeConfig) {
				console.error('❌ Claude Desktop configuration not found');
				console.log('Run "backlog-mcp setup" to configure');
				process.exit(1);
			}
			
			// Check if our server is configured
			if (!claudeConfig.mcpServers || !claudeConfig.mcpServers['backlog-md']) {
				console.error('❌ Backlog.md MCP server not configured in Claude Desktop');
				console.log('Run "backlog-mcp setup" to configure');
				process.exit(1);
			}
			
			console.log('✅ Claude Desktop configuration found');
			console.log('✅ Backlog.md MCP server configured');
			
			// Check if Backlog.md is accessible
			try {
				execSync('npx backlog --version', { stdio: 'ignore' });
				console.log('✅ Backlog.md CLI accessible');
			} catch {
				console.warn('⚠️  Backlog.md CLI not found globally');
				console.log('   The bundled version will be used');
			}
			
			console.log('\n✨ Setup validated successfully!');
			console.log('Restart Claude Desktop to use Backlog.md integration');
			
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

This server integrates Backlog.md task management with Claude Desktop
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