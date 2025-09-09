import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import { existsSync } from 'fs';

/**
 * Get the path to Claude Desktop configuration file
 */
export async function getClaudeConfigPath(): Promise<string | null> {
	const platform = process.platform;
	let configPath: string;
	
	switch (platform) {
		case 'darwin': // macOS
			configPath = path.join(
				os.homedir(),
				'Library',
				'Application Support',
				'Claude',
				'claude_desktop_config.json'
			);
			break;
			
		case 'win32': // Windows
			configPath = path.join(
				process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'),
				'Claude',
				'claude_desktop_config.json'
			);
			break;
			
		case 'linux':
			configPath = path.join(
				os.homedir(),
				'.config',
				'claude',
				'claude_desktop_config.json'
			);
			break;
			
		default:
			return null;
	}
	
	try {
		await fs.access(configPath);
		return configPath;
	} catch {
		// Try to create the directory and file if it doesn't exist
		try {
			const dir = path.dirname(configPath);
			await fs.mkdir(dir, { recursive: true });
			await fs.writeFile(configPath, JSON.stringify({ mcpServers: {} }, null, 2));
			return configPath;
		} catch {
			return null;
		}
	}
}

/**
 * Read Claude Desktop configuration
 */
export async function readClaudeConfig(configPath: string): Promise<any> {
	try {
		const content = await fs.readFile(configPath, 'utf-8');
		return JSON.parse(content);
	} catch (error) {
		if ((error as any).code === 'ENOENT') {
			return null;
		}
		throw error;
	}
}

/**
 * Write Claude Desktop configuration
 */
export async function writeClaudeConfig(configPath: string, config: any): Promise<void> {
	const dir = path.dirname(configPath);
	await fs.mkdir(dir, { recursive: true });
	await fs.writeFile(configPath, JSON.stringify(config, null, 2));
}

/**
 * Get Claude Desktop configuration
 */
export async function getClaudeConfig(): Promise<any> {
	const configPath = await getClaudeConfigPath();
	if (!configPath) return null;
	return readClaudeConfig(configPath);
}

/**
 * Get local Backlog MCP configuration
 */
export async function getLocalConfig(): Promise<any> {
	const configPath = path.join(os.homedir(), '.backlog-mcp', 'config.json');
	try {
		const content = await fs.readFile(configPath, 'utf-8');
		return JSON.parse(content);
	} catch {
		return {};
	}
}

/**
 * Save local Backlog MCP configuration
 */
export async function saveLocalConfig(config: any): Promise<void> {
	const configDir = path.join(os.homedir(), '.backlog-mcp');
	const configPath = path.join(configDir, 'config.json');
	
	await fs.mkdir(configDir, { recursive: true });
	await fs.writeFile(configPath, JSON.stringify(config, null, 2));
}

/**
 * Get a configuration value
 */
export async function get(key: string): Promise<any> {
	const config = await getLocalConfig();
	return config[key];
}

/**
 * Set a configuration value
 */
export async function set(key: string, value: any): Promise<void> {
	const config = await getLocalConfig();
	config[key] = value;
	await saveLocalConfig(config);
}

/**
 * Get all configuration values
 */
export async function getAll(): Promise<any> {
	return getLocalConfig();
}

/**
 * Get the path to the Backlog.md CLI
 */
export async function getBacklogCliPath(): Promise<string> {
	// First, check if there's a custom path in config
	const customPath = await get('backlogCliPath');
	if (customPath) {
		return customPath;
	}
	
	// Try to find the bundled version
	try {
		// ES module workaround for __dirname
		const __dirname = path.dirname(fileURLToPath(import.meta.url));
		const bundledPath = path.join(__dirname, '..', 'node_modules', '.bin', 'backlog');
		await fs.access(bundledPath);
		return bundledPath;
	} catch {
		// Fall back to global installation
		return 'backlog';
	}
}

/**
 * Check if Backlog.md is initialized in a directory
 */
export function isBacklogInitialized(projectPath: string = process.cwd()): boolean {
	// Check for backlog/config.yml (current standard)
	const standardConfigPath = path.join(projectPath, 'backlog', 'config.yml');
	if (existsSync(standardConfigPath)) {
		return true;
	}
	
	// Check for .backlog/config.yml (legacy location)
	const legacyConfigPath = path.join(projectPath, '.backlog', 'config.yml');
	if (existsSync(legacyConfigPath)) {
		return true;
	}
	
	return false;
}


export default {
	getClaudeConfigPath,
	readClaudeConfig,
	writeClaudeConfig,
	getClaudeConfig,
	getLocalConfig,
	saveLocalConfig,
	get,
	set,
	getAll,
	getBacklogCliPath,
	isBacklogInitialized
};