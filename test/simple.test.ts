import { describe, test, expect } from 'bun:test';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('Simple Structure Tests', () => {
	test('source directory exists', async () => {
		const sourceDir = path.join(__dirname, '..');
		const stats = await fs.stat(sourceDir);
		expect(stats.isDirectory()).toBe(true);
	});
	
	test('source has package.json', async () => {
		const packagePath = path.join(__dirname, '..', 'package.json');
		const exists = await fs.access(packagePath).then(() => true).catch(() => false);
		expect(exists).toBe(true);
	});
	
	test('source has src directory', async () => {
		const srcDir = path.join(__dirname, '..', 'src');
		const stats = await fs.stat(srcDir);
		expect(stats.isDirectory()).toBe(true);
	});
	
	test('main TypeScript files exist', async () => {
		const files = ['index.ts', 'server.ts', 'config.ts', 'cli.ts'];
		for (const file of files) {
			const filePath = path.join(__dirname, '..', 'src', file);
			const exists = await fs.access(filePath).then(() => true).catch(() => false);
			expect(exists).toBe(true);
		}
	});
});

describe('Consolidated Project Tests', () => {
	test('bin directory exists', async () => {
		const binDir = path.join(__dirname, '..', 'bin');
		const stats = await fs.stat(binDir);
		expect(stats.isDirectory()).toBe(true);
	});
	
	test('npm directory exists', async () => {
		const npmDir = path.join(__dirname, '..', 'npm');
		const stats = await fs.stat(npmDir);
		expect(stats.isDirectory()).toBe(true);
	});
	
	test('dist directory with compiled files exists after build', async () => {
		const distDir = path.join(__dirname, '..', 'dist');
		const exists = await fs.access(distDir).then(() => true).catch(() => false);
		expect(exists).toBe(true);
		
		if (exists) {
			const files = await fs.readdir(distDir);
			expect(files.length).toBeGreaterThan(0);
			expect(files).toContain('cli.js');
			expect(files).toContain('server.js');
		}
	});
});