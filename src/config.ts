import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import { existsSync } from 'fs';
import { execSync } from 'child_process';

/**
 * Parse version from npm dependency string (handles ^, ~, >=, etc.)
 */
function parseVersionFromDependency(dependencyString: string): string {
	// Remove common npm version prefixes and extract the version number
	const versionMatch = dependencyString.match(/(\d+\.\d+\.\d+)/);
	return versionMatch?.[1] ?? dependencyString.replace(/^[\^~>=<\s]+/, '');
}

/**
 * Get the supported Backlog.md version from package.json
 */
async function getSupportedBacklogVersion(): Promise<string> {
	try {
		const __dirname = path.dirname(fileURLToPath(import.meta.url));
		const packageJsonPath = path.join(__dirname, '..', 'package.json');
		const packageContent = await fs.readFile(packageJsonPath, 'utf-8');
		const packageJson = JSON.parse(packageContent);
		
		const backlogDependency = packageJson.dependencies?.['backlog.md'];
		if (backlogDependency) {
			return parseVersionFromDependency(backlogDependency);
		}
		
		// Fallback to hardcoded version if not found in dependencies
		return '1.10.2';
	} catch (error) {
		// Fallback to hardcoded version if package.json can't be read
		return '1.10.2';
	}
}

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

/**
 * Get the version of the installed Backlog.md CLI
 */
export async function getBacklogVersion(): Promise<string | null> {
	try {
		const backlogPath = await getBacklogCliPath();
		const result = execSync(`"${backlogPath}" --version`, { 
			encoding: 'utf8', 
			stdio: ['ignore', 'pipe', 'ignore'],
			timeout: 5000,
			windowsHide: true
		});
		
		// Extract version number from output (e.g. "1.10.2" from various formats)
		const versionMatch = result.trim().match(/(\d+\.\d+\.\d+)/);
		return versionMatch?.[1] ?? result.trim();
	} catch (error) {
		return null;
	}
}

/**
 * Compare two semantic version strings
 * Returns: 1 if version1 > version2, -1 if version1 < version2, 0 if equal
 */
function compareVersions(version1: string, version2: string): number {
	const parts1 = version1.split('.').map(n => parseInt(n, 10));
	const parts2 = version2.split('.').map(n => parseInt(n, 10));
	
	for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
		const part1 = parts1[i] || 0;
		const part2 = parts2[i] || 0;
		
		if (part1 > part2) return 1;
		if (part1 < part2) return -1;
	}
	
	return 0;
}

/**
 * Check version compatibility with supported Backlog.md version
 */
export async function checkVersionCompatibility(): Promise<{
	installedVersion: string | null;
	supportedVersion: string;
	isCompatible: boolean;
	isNewer: boolean;
}> {
	const supportedVersion = await getSupportedBacklogVersion();
	const installedVersion = await getBacklogVersion();
	
	if (!installedVersion) {
		return {
			installedVersion: null,
			supportedVersion,
			isCompatible: false,
			isNewer: false
		};
	}
	
	const comparison = compareVersions(installedVersion, supportedVersion);
	
	return {
		installedVersion,
		supportedVersion,
		isCompatible: comparison <= 0, // Compatible if same or older
		isNewer: comparison > 0
	};
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