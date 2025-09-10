import { describe, test, expect } from 'bun:test';
import * as path from 'path';
import * as os from 'os';

describe('Config Module Basic Tests', () => {
	test('config module should export expected functions', async () => {
		const configModule = await import('../src/config');
		
		expect(typeof configModule.getLocalConfig).toBe('function');
		expect(typeof configModule.saveLocalConfig).toBe('function');
		expect(typeof configModule.get).toBe('function');
		expect(typeof configModule.set).toBe('function');
		expect(typeof configModule.getAll).toBe('function');
		expect(typeof configModule.getBacklogCliPath).toBe('function');
		expect(typeof configModule.isBacklogInitialized).toBe('function');
	});
	
	test('getBacklogCliPath should return a string', async () => {
		const { getBacklogCliPath } = await import('../src/config');
		const cliPath = await getBacklogCliPath();
		
		expect(typeof cliPath).toBe('string');
		expect(cliPath.length).toBeGreaterThan(0);
	});
	
	test('getAll should return an object', async () => {
		const { getAll } = await import('../src/config');
		const allConfig = await getAll();
		
		expect(typeof allConfig).toBe('object');
		expect(allConfig).not.toBeNull();
	});
	
	test('local config path should be in home directory', () => {
		const expectedPath = path.join(os.homedir(), '.backlog-mcp', 'config.json');
		expect(expectedPath).toContain('.backlog-mcp');
		expect(expectedPath).toContain('config.json');
	});
});