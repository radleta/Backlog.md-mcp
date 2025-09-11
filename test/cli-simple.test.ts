import { describe, test, expect } from 'bun:test';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

describe('CLI Integration Tests', () => {
	const cliPath = path.join(__dirname, '..', 'bin', 'backlog-mcp.js');
	const distCliPath = path.join(__dirname, '..', 'dist', 'cli.js');
	
	// Check if project is built (dist directory exists)
	const isBuilt = fs.existsSync(distCliPath);
	
	describe('CLI Executable', () => {
		test('CLI script should exist', async () => {
			const fs = await import('fs/promises');
			const exists = await fs.access(cliPath).then(() => true).catch(() => false);
			expect(exists).toBe(true);
		});
		
		test('CLI should run with --version', (done) => {
			if (!isBuilt) {
				console.warn('Skipping CLI test - project not built (dist/cli.js missing)');
				done();
				return;
			}
			
			const child = spawn('node', [cliPath, '--version']);
			let output = '';
			
			child.stdout.on('data', (data) => {
				output += data.toString();
			});
			
			child.on('exit', (code) => {
				expect(code).toBe(0);
				expect(output.trim()).toMatch(/^\d+\.\d+\.\d+$/);
				done();
			});
			
			child.on('error', (err) => {
				done(err);
			});
		}, 5000);
		
		test('CLI should run with --help', (done) => {
			if (!isBuilt) {
				console.warn('Skipping CLI test - project not built (dist/cli.js missing)');
				done();
				return;
			}
			
			const child = spawn('node', [cliPath, '--help']);
			let output = '';
			
			child.stdout.on('data', (data) => {
				output += data.toString();
			});
			
			child.on('exit', (code) => {
				expect(code).toBe(0);
				expect(output).toContain('Backlog.md MCP Server');
				expect(output).toContain('Commands:');
				expect(output).toContain('start');
				expect(output).toContain('setup');
				expect(output).toContain('config');
				done();
			});
			
			child.on('error', (err) => {
				done(err);
			});
		}, 5000);
		
		test('CLI info command should work', (done) => {
			if (!isBuilt) {
				console.warn('Skipping CLI test - project not built (dist/cli.js missing)');
				done();
				return;
			}
			
			const child = spawn('node', [cliPath, 'info']);
			let output = '';
			
			child.stdout.on('data', (data) => {
				output += data.toString();
			});
			
			child.on('exit', (code) => {
				expect(code).toBe(0);
				expect(output).toContain('Backlog.md MCP Server');
				expect(output).toContain('Available Tools:');
				expect(output).toContain('task_create');
				done();
			});
			
			child.on('error', (err) => {
				done(err);
			});
		}, 5000);
	});
	
	describe('CLI Commands Structure', () => {
		test('start command should accept options', (done) => {
			if (!isBuilt) {
				console.warn('Skipping CLI test - project not built (dist/cli.js missing)');
				done();
				return;
			}
			
			const child = spawn('node', [cliPath, 'start', '--help']);
			let output = '';
			
			child.stdout.on('data', (data) => {
				output += data.toString();
			});
			
			child.on('exit', (code) => {
				expect(code).toBe(0);
				expect(output).toContain('--verbose');
				done();
			});
			
			child.on('error', (err) => {
				done(err);
			});
		}, 5000);
	});
});