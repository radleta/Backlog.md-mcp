import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import { existsSync } from 'fs';
import { execSync } from 'child_process';

/**
 * Get the configuration directory path based on environment
 */
function getConfigDir(): string {
	const isDevelopment = process.env.BACKLOG_ENV === 'development';
	const customConfigDir = process.env.BACKLOG_CONFIG_DIR;
	
	if (customConfigDir) {
		return customConfigDir;
	}
	
	const baseName = isDevelopment ? '.backlog-mcp-dev' : '.backlog-mcp';
	return path.join(os.homedir(), baseName);
}

/**
 * Get local Backlog MCP configuration
 */
export async function getLocalConfig(): Promise<any> {
	const configDir = getConfigDir();
	const configPath = path.join(configDir, 'config.json');
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
	const configDir = getConfigDir();
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
 * Find the backlog executable using multiple strategies
 */
async function findBacklogExecutable(): Promise<string | null> {
	const isWindows = process.platform === 'win32';
	
	// Strategy 1: Use system command to locate executable
	try {
		const command = isWindows ? 'where' : 'which';
		const executable = isWindows ? 'backlog' : 'backlog';
		
		const result = execSync(`${command} ${executable}`, { 
			encoding: 'utf8',
			stdio: ['ignore', 'pipe', 'ignore'], // Suppress stderr
			timeout: 2000, // 2 second timeout to prevent hanging
			windowsHide: true // Prevent Windows popup windows
		});
		
		// Return first match (where/which may return multiple lines)
		const firstMatch = result.trim().split('\n')[0];
		if (firstMatch && existsSync(firstMatch)) {
			return firstMatch;
		}
	} catch {
		// Continue to next strategy
	}
	
	// Strategy 2: Check npm global installation
	try {
		const npmRoot = execSync('npm root -g', { 
			encoding: 'utf8',
			stdio: ['ignore', 'pipe', 'ignore'],
			timeout: 3000, // 3 second timeout for npm command
			windowsHide: true
		}).trim();
		
		const candidates = isWindows 
			? [
				path.join(npmRoot, '.bin', 'backlog.cmd'),
				path.join(npmRoot, '.bin', 'backlog.exe'),
				path.join(npmRoot, '..', 'backlog.cmd'),
				path.join(npmRoot, '..', 'backlog.exe')
			]
			: [
				path.join(npmRoot, '.bin', 'backlog')
			];
		
		for (const candidate of candidates) {
			if (existsSync(candidate)) {
				return candidate;
			}
		}
	} catch {
		// Continue to next strategy
	}
	
	// Strategy 3: Check common Windows installation locations
	if (isWindows) {
		const commonPaths = [
			path.join(process.env.APPDATA || '', 'npm', 'backlog.cmd'),
			path.join(process.env.APPDATA || '', 'npm', 'backlog.exe'),
			path.join(process.env.APPDATA || '', 'npm', 'backlog'),
			path.join(process.env.PROGRAMFILES || '', 'nodejs', 'backlog.cmd'),
			path.join(process.env.PROGRAMFILES || '', 'nodejs', 'backlog.exe'),
			path.join(process.env.PROGRAMFILES || '', 'nodejs', 'backlog'),
			'C:\\Program Files\\nodejs\\backlog.cmd',
			'C:\\Program Files\\nodejs\\backlog.exe',
			'C:\\Program Files\\nodejs\\backlog'
		];
		
		for (const candidatePath of commonPaths) {
			if (existsSync(candidatePath)) {
				return candidatePath;
			}
		}
	}
	
	// Strategy 4: Check local node_modules (bundled version)
	try {
		const __dirname = path.dirname(fileURLToPath(import.meta.url));
		const candidates = isWindows 
			? [
				path.join(__dirname, '..', 'node_modules', '.bin', 'backlog.cmd'),
				path.join(__dirname, '..', 'node_modules', '.bin', 'backlog.exe')
			]
			: [
				path.join(__dirname, '..', 'node_modules', '.bin', 'backlog')
			];
		
		for (const candidate of candidates) {
			if (existsSync(candidate)) {
				return candidate;
			}
		}
	} catch {
		// Continue to fallback
	}
	
	return null;
}

/**
 * Get the path to the Backlog.md CLI
 */
export async function getBacklogCliPath(): Promise<string> {
	// First, check if there's a custom path in config
	const customPath = await get('backlogCliPath');
	if (customPath) {
		// Verify the custom path exists
		if (existsSync(customPath)) {
			return customPath;
		} else {
			// Custom path is invalid, continue with detection
			console.warn(`Configured backlog CLI path "${customPath}" does not exist, attempting to auto-detect...`);
		}
	}
	
	// Use cross-platform detection
	const detectedPath = await findBacklogExecutable();
	if (detectedPath) {
		return detectedPath;
	}
	
	// Final fallback - try simple command name and let system PATH handle it
	const isWindows = process.platform === 'win32';
	return isWindows ? 'backlog.cmd' : 'backlog';
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