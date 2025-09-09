import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import { getClaudeConfigPath, readClaudeConfig, writeClaudeConfig } from './config.js';

interface SetupOptions {
	force?: boolean;
	path?: string;
}

/**
 * Run the interactive setup wizard
 */
export async function runSetupWizard(options: SetupOptions = {}) {
	console.log(chalk.blue.bold('\n🚀 Backlog.md MCP Setup Wizard\n'));
	
	// Check if already configured
	if (!options.force) {
		const existingConfig = await checkExistingSetup();
		if (existingConfig) {
			const { overwrite } = await inquirer.prompt([
				{
					type: 'confirm',
					name: 'overwrite',
					message: 'Backlog.md MCP is already configured. Do you want to reconfigure?',
					default: false
				}
			]);
			
			if (!overwrite) {
				console.log(chalk.yellow('Setup cancelled.'));
				return;
			}
		}
	}
	
	// Get Claude Desktop config path
	const configPath = options.path || await getClaudeConfigPath();
	
	if (!configPath) {
		console.error(chalk.red('❌ Could not find Claude Desktop configuration file.'));
		console.log(chalk.yellow('\nPlease ensure Claude Desktop is installed.'));
		console.log(chalk.gray('Expected locations:'));
		console.log(chalk.gray('  macOS: ~/Library/Application Support/Claude/claude_desktop_config.json'));
		console.log(chalk.gray('  Windows: %APPDATA%\\Claude\\claude_desktop_config.json'));
		console.log(chalk.gray('  Linux: ~/.config/claude/claude_desktop_config.json'));
		process.exit(1);
	}
	
	console.log(chalk.green(`✓ Found Claude Desktop config at: ${configPath}`));
	
	// Ask for configuration options
	const answers = await inquirer.prompt([
		{
			type: 'list',
			name: 'transport',
			message: 'Which transport would you like to use?',
			choices: [
				{ name: 'STDIO (recommended)', value: 'stdio' },
				{ name: 'HTTP', value: 'http' }
			],
			default: 'stdio'
		},
		{
			type: 'number',
			name: 'port',
			message: 'Which port should the HTTP server use?',
			default: 3000,
			when: (answers) => answers.transport === 'http'
		},
		{
			type: 'confirm',
			name: 'autoStart',
			message: 'Should the server start automatically with Claude Desktop?',
			default: true
		}
	]);
	
	// Configure the server
	const spinner = ora('Configuring Claude Desktop...').start();
	
	try {
		// Read existing config
		const config = await readClaudeConfig(configPath) || { mcpServers: {} };
		
		// Get the path to this package - ES module workaround for __dirname
		const __dirname = path.dirname(fileURLToPath(import.meta.url));
		const packagePath = path.join(__dirname, '..');
		const execPath = path.join(packagePath, 'bin', 'backlog-mcp');
		
		// Configure based on transport
		if (answers.transport === 'stdio') {
			config.mcpServers = config.mcpServers || {};
			config.mcpServers['backlog-md'] = {
				command: 'node',
				args: [execPath, 'start', '--transport', 'stdio']
			};
		} else {
			config.mcpServers = config.mcpServers || {};
			config.mcpServers['backlog-md'] = {
				command: 'node',
				args: [
					execPath,
					'start',
					'--transport',
					'http',
					'--port',
					answers.port.toString()
				]
			};
		}
		
		// Write the config
		await writeClaudeConfig(configPath, config);
		
		spinner.succeed('Claude Desktop configured successfully!');
		
		// Save local configuration
		await saveLocalConfig({
			transport: answers.transport,
			port: answers.port,
			autoStart: answers.autoStart,
			claudeConfigPath: configPath
		});
		
		console.log(chalk.green('\n✨ Setup complete!\n'));
		console.log(chalk.cyan('Next steps:'));
		console.log(chalk.white('  1. Restart Claude Desktop'));
		console.log(chalk.white('  2. In Claude, you can now use Backlog.md commands like:'));
		console.log(chalk.gray('     - "Create a new task for implementing user auth"'));
		console.log(chalk.gray('     - "Show me all tasks in progress"'));
		console.log(chalk.gray('     - "Display the Kanban board"'));
		console.log(chalk.white('\n  3. Run "backlog-mcp validate" to test the setup'));
		
	} catch (error) {
		spinner.fail('Configuration failed');
		throw error;
	}
}

/**
 * Check if MCP is already configured
 */
async function checkExistingSetup(): Promise<boolean> {
	try {
		const configPath = await getClaudeConfigPath();
		if (!configPath) return false;
		
		const config = await readClaudeConfig(configPath);
		return config?.mcpServers?.['backlog-md'] !== undefined;
	} catch {
		return false;
	}
}

/**
 * Save local configuration
 */
async function saveLocalConfig(config: any) {
	const configDir = path.join(os.homedir(), '.backlog-mcp');
	const configPath = path.join(configDir, 'config.json');
	
	try {
		await fs.mkdir(configDir, { recursive: true });
		await fs.writeFile(configPath, JSON.stringify(config, null, 2));
	} catch (error) {
		console.warn(chalk.yellow('Warning: Could not save local configuration'));
	}
}

// Export for use in CLI
export default { runSetupWizard };