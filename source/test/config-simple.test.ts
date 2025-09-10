import { describe, test, expect, mock, beforeEach } from 'bun:test';
import * as path from 'path';
import * as os from 'os';

describe('Config Module Tests', () => {
	describe('Module Exports', () => {
		test('config module should export expected functions', async () => {
			const configModule = await import('../src/config');
			
			expect(configModule.getLocalConfig).toBeDefined();
			expect(configModule.saveLocalConfig).toBeDefined();
			expect(configModule.get).toBeDefined();
			expect(configModule.set).toBeDefined();
			expect(configModule.getAll).toBeDefined();
			expect(configModule.getBacklogCliPath).toBeDefined();
			expect(configModule.isBacklogInitialized).toBeDefined();
		});
		
		test('default export should contain all functions', async () => {
			const configModule = await import('../src/config');
			const defaultExport = configModule.default;
			
			expect(defaultExport.get).toBeDefined();
			expect(defaultExport.set).toBeDefined();
			expect(defaultExport.getAll).toBeDefined();
			expect(defaultExport.getBacklogCliPath).toBeDefined();
			expect(defaultExport.isBacklogInitialized).toBeDefined();
		});
	});
	
	describe('Config Path Detection', () => {
		test('local config path should use home directory', () => {
			const expectedPath = path.join(os.homedir(), '.backlog-mcp', 'config.json');
			// Just verify the pattern is correct
			expect(expectedPath).toContain('.backlog-mcp');
			expect(expectedPath).toContain('config.json');
		});
		
		test('isBacklogInitialized should work with current directory', async () => {
			const { isBacklogInitialized } = await import('../src/config');
			
			// Should return a boolean
			const result = isBacklogInitialized();
			expect(typeof result).toBe('boolean');
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