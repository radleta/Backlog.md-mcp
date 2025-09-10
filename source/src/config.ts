import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import { existsSync } from 'fs';

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
	getLocalConfig,
	saveLocalConfig,
	get,
	set,
	getAll,
	getBacklogCliPath,
	isBacklogInitialized
};