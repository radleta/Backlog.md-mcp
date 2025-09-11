import { describe, test, expect } from 'bun:test';
import * as fs from 'fs/promises';
import * as path from 'path';

// Helper to check if project is built
const isBuilt = async () => {
	const distDir = path.join(__dirname, '..', 'dist');
	return await fs.access(distDir).then(() => true).catch(() => false);
};

describe('Consolidated Project Tests', () => {
	describe('Project Structure', () => {
		test('root package.json should be valid', async () => {
			const packagePath = path.join(__dirname, '..', 'package.json');
			const content = await fs.readFile(packagePath, 'utf-8');
			const pkg = JSON.parse(content);
			
			expect(pkg.name).toBe('@radleta/backlog-md-mcp');
			expect(pkg.private).toBe(false);
			expect(pkg.version).toBeTruthy();
			expect(pkg.scripts).toHaveProperty('build');
			expect(pkg.scripts).toHaveProperty('test');
		});
		
		test('source files should exist', async () => {
			const sourceFiles = [
				'src/index.ts',
				'src/server.ts',
				'src/config.ts',
				'src/cli.ts'
			];
			
			for (const file of sourceFiles) {
				const filePath = path.join(__dirname, '..', file);
				const result = await fs.access(filePath).then(() => true).catch(() => false);
				expect(result).toBe(true);
			}
		});
		
		test('TypeScript config should exist', async () => {
			const tsconfigPath = path.join(__dirname, '..', 'tsconfig.json');
			const result = await fs.access(tsconfigPath).then(() => true).catch(() => false);
			expect(result).toBe(true);
			
			const content = await fs.readFile(tsconfigPath, 'utf-8');
			const tsconfig = JSON.parse(content);
			
			expect(tsconfig.compilerOptions).toBeTruthy();
			expect(tsconfig.compilerOptions.outDir).toBe('./dist');
			expect(tsconfig.compilerOptions.strict).toBe(true);
		});
	});
	
	describe('Package Documentation Structure', () => {
		test('user README should exist in root', async () => {
			const readmePath = path.join(__dirname, '..', 'README.md');
			const result = await fs.access(readmePath).then(() => true).catch(() => false);
			expect(result).toBe(true);
		});
		
		test('developer README.md should exist', async () => {
			const readmePath = path.join(__dirname, '..', '.github', 'README.md');
			const result = await fs.access(readmePath).then(() => true).catch(() => false);
			expect(result).toBe(true);
		});
		
		test('bin scripts should exist', async () => {
			const binFiles = [
				'backlog-mcp.js',
				'backlog-mcp-dev.js'
			];
			
			for (const binFile of binFiles) {
				const binPath = path.join(__dirname, '..', 'bin', binFile);
				const result = await fs.access(binPath).then(() => true).catch(() => false);
				expect(result).toBe(true);
				
				// Check it's executable
				const stats = await fs.stat(binPath);
				if (process.platform !== 'win32') {
					expect(stats.mode & 0o111).toBeGreaterThan(0);
				}
			}
		});
		
		test('project documentation should exist', async () => {
			const docs = [
				'README.md',
				'CLAUDE.md',
				'CHANGELOG.md'
			];
			
			for (const doc of docs) {
				const docPath = path.join(__dirname, '..', doc);
				const result = await fs.access(docPath).then(() => true).catch(() => false);
				expect(result).toBe(true);
			}
		});
	});
	
	describe('Build Output', () => {
		test('dist directory should exist after build', async () => {
			const built = await isBuilt();
			if (!built) {
				console.warn('Skipping build output test - project not built (run `npm run build` first)');
				return;
			}
			expect(built).toBe(true);
		});
		
		test('compiled files should exist', async () => {
			const built = await isBuilt();
			if (!built) {
				console.warn('Skipping compiled files test - project not built (run `npm run build` first)');
				return;
			}
			
			const compiledFiles = [
				'index.js',
				'server.js',
				'config.js',
				'cli.js'
			];
			
			for (const file of compiledFiles) {
				const filePath = path.join(__dirname, '..', 'dist', file);
				const result = await fs.access(filePath).then(() => true).catch(() => false);
				expect(result).toBe(true);
			}
		});
		
		test('type definitions should exist', async () => {
			const built = await isBuilt();
			if (!built) {
				console.warn('Skipping type definitions test - project not built (run `npm run build` first)');
				return;
			}
			
			const typeFiles = [
				'index.d.ts',
				'server.d.ts',
				'config.d.ts',
				'cli.d.ts'
			];
			
			for (const file of typeFiles) {
				const filePath = path.join(__dirname, '..', 'dist', file);
				const result = await fs.access(filePath).then(() => true).catch(() => false);
				expect(result).toBe(true);
			}
		});
	});
	
	describe('Dependencies', () => {
		test('source should have dev dependencies', () => {
			const pkg = require('../package.json');
			
			expect(pkg.devDependencies).toHaveProperty('typescript');
			expect(pkg.devDependencies).toHaveProperty('eslint');
			expect(pkg.devDependencies).toHaveProperty('prettier');
			expect(pkg.devDependencies).toHaveProperty('@types/node');
		});
		
		test('package should have runtime dependencies', async () => {
			const packagePath = path.join(__dirname, '..', 'package.json');
			const content = await fs.readFile(packagePath, 'utf-8');
			const pkg = JSON.parse(content);
			
			expect(pkg.dependencies).toHaveProperty('@modelcontextprotocol/sdk');
			expect(pkg.dependencies).toHaveProperty('commander');
			expect(pkg.dependencies).toHaveProperty('inquirer');
			expect(pkg.dependencies).toHaveProperty('chalk');
		});
	});
});