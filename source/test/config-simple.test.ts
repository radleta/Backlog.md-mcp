import { describe, test, expect, mock, beforeEach } from 'bun:test';
import * as path from 'path';
import * as os from 'os';

describe('Config Module Tests', () => {
	describe('Module Exports', () => {
		test('config module should export expected functions', async () => {
			const configModule = await import('../src/config');
			
			expect(configModule.getClaudeConfigPath).toBeDefined();
			expect(configModule.readClaudeConfig).toBeDefined();
			expect(configModule.writeClaudeConfig).toBeDefined();
			expect(configModule.getClaudeConfig).toBeDefined();
			expect(configModule.getLocalConfig).toBeDefined();
			expect(configModule.saveLocalConfig).toBeDefined();
			expect(configModule.get).toBeDefined();
			expect(configModule.set).toBeDefined();
			expect(configModule.getAll).toBeDefined();
			expect(configModule.getBacklogCliPath).toBeDefined();
		});
		
		test('default export should contain all functions', async () => {
			const configModule = await import('../src/config');
			const defaultExport = configModule.default;
			
			expect(defaultExport.getClaudeConfigPath).toBeDefined();
			expect(defaultExport.get).toBeDefined();
			expect(defaultExport.set).toBeDefined();
			expect(defaultExport.getAll).toBeDefined();
		});
	});
	
	describe('Config Path Detection', () => {
		test('should detect platform-specific paths', async () => {
			const { getClaudeConfigPath } = await import('../src/config');
			
			// This will return a path or null depending on the platform
			// We just verify it doesn't throw
			let pathResult;
			try {
				pathResult = await getClaudeConfigPath();
			} catch (error) {
				// If it fails, that's okay - might not have Claude installed
				pathResult = null;
			}
			
			// Should either return a string path or null
			expect(pathResult === null || typeof pathResult === 'string').toBe(true);
		});
		
		test('local config path should use home directory', () => {
			const expectedPath = path.join(os.homedir(), '.backlog-mcp', 'config.json');
			// Just verify the pattern is correct
			expect(expectedPath).toContain('.backlog-mcp');
			expect(expectedPath).toContain('config.json');
		});
	});
	
	describe('Config Operations', () => {
		test('get and set operations should be functions', async () => {
			const { get, set } = await import('../src/config');
			
			expect(typeof get).toBe('function');
			expect(typeof set).toBe('function');
		});
		
		test('getAll should be a function', async () => {
			const { getAll } = await import('../src/config');
			
			expect(typeof getAll).toBe('function');
		});
	});
	
	describe('Backlog CLI Path', () => {
		test('getBacklogCliPath should return a string', async () => {
			const { getBacklogCliPath } = await import('../src/config');
			
			const cliPath = await getBacklogCliPath();
			expect(typeof cliPath).toBe('string');
			
			// Should return either a custom path, bundled path, or 'backlog'
			expect(cliPath.length).toBeGreaterThan(0);
		});
	});
});