import { describe, test, expect } from 'bun:test';
import { spawn } from 'child_process';

describe('Shell Argument Handling Tests', () => {
	test('should handle arguments with spaces correctly on Unix', async () => {
		// Skip on Windows since we're testing Unix-specific behavior
		if (process.platform === 'win32') {
			return;
		}

		// Test that arguments with spaces work without shell escaping
		const result = await new Promise<{ stdout: string; stderr: string; code: number }>((resolve) => {
			const child = spawn('echo', ['hello world', 'test arg'], { shell: false });
			
			let stdout = '';
			let stderr = '';
			
			child.stdout.on('data', (data) => {
				stdout += data.toString();
			});
			
			child.stderr.on('data', (data) => {
				stderr += data.toString();
			});
			
			child.on('close', (code) => {
				resolve({ stdout, stderr, code: code || 0 });
			});
		});

		// Should receive arguments as separate values when shell: false
		expect(result.stdout.trim()).toBe('hello world test arg');
		expect(result.code).toBe(0);
	});

	test('should handle quoted arguments incorrectly with shell escaping on Unix', async () => {
		// Skip on Windows since we're testing Unix-specific behavior
		if (process.platform === 'win32') {
			return;
		}

		// Test that shell-escaped arguments become literal quotes when shell: false
		const quotedArg = "'hello world'"; // This is what our old code would produce
		
		const result = await new Promise<{ stdout: string; stderr: string; code: number }>((resolve) => {
			const child = spawn('echo', [quotedArg], { shell: false });
			
			let stdout = '';
			let stderr = '';
			
			child.stdout.on('data', (data) => {
				stdout += data.toString();
			});
			
			child.stderr.on('data', (data) => {
				stderr += data.toString();
			});
			
			child.on('close', (code) => {
				resolve({ stdout, stderr, code: code || 0 });
			});
		});

		// When shell: false, quotes become part of the argument
		expect(result.stdout.trim()).toBe("'hello world'");
		expect(result.code).toBe(0);
	});

	test('should handle shell escaping correctly on Windows simulation', () => {
		// Simulate what happens on Windows with shell: true
		// This is more of a documentation test since we can't easily test shell: true cross-platform
		
		const testArgs = ['hello world', 'test with spaces'];
		const escapedArgs = testArgs.map(arg => {
			// Simulate Windows escaping (double quotes)
			if (arg.includes(' ')) {
				return `"${arg.replace(/"/g, '""')}"`;
			}
			return arg;
		});

		expect(escapedArgs).toEqual(['"hello world"', '"test with spaces"']);
	});

	test('should demonstrate the difference between shell modes', async () => {
		// Skip on Windows for this Unix-specific test
		if (process.platform === 'win32') {
			return;
		}

		const testArg = 'hello world';
		
		// Test shell: false (our fixed approach on Unix)
		const resultNoShell = await new Promise<string>((resolve) => {
			const child = spawn('echo', [testArg], { shell: false });
			let stdout = '';
			child.stdout.on('data', (data) => { stdout += data.toString(); });
			child.on('close', () => resolve(stdout.trim()));
		});

		// Test shell: true with escaped argument
		const escapedArg = `'${testArg}'`;
		const resultWithShell = await new Promise<string>((resolve) => {
			const child = spawn('echo', [escapedArg], { shell: true });
			let stdout = '';
			child.stdout.on('data', (data) => { stdout += data.toString(); });
			child.on('close', () => resolve(stdout.trim()));
		});

		// shell: false passes the argument directly
		expect(resultNoShell).toBe('hello world');
		
		// shell: true interprets the quotes and removes them
		expect(resultWithShell).toBe('hello world');
		
		// But if we use shell: false with escaped args (our bug), we get literal quotes
		const resultBuggyApproach = await new Promise<string>((resolve) => {
			const child = spawn('echo', [escapedArg], { shell: false });
			let stdout = '';
			child.stdout.on('data', (data) => { stdout += data.toString(); });
			child.on('close', () => resolve(stdout.trim()));
		});
		
		expect(resultBuggyApproach).toBe("'hello world'");
	});
});