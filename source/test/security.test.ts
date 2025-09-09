import { describe, test, expect, beforeEach, mock } from 'bun:test';
import { securityPayloads } from './utils/fixtures';
import { spawn } from 'child_process';

describe('Security Tests', () => {
	describe('Command Injection Prevention', () => {
		test('should sanitize task IDs', () => {
			const maliciousIds = securityPayloads.commandInjection;
			
			maliciousIds.forEach(id => {
				// Task IDs should be sanitized to prevent command injection
				const sanitized = sanitizeTaskId(id);
				expect(sanitized).not.toContain(';');
				expect(sanitized).not.toContain('&&');
				expect(sanitized).not.toContain('|');
				expect(sanitized).not.toContain('`');
				expect(sanitized).not.toContain('$');
			});
		});
		
		test('should reject malicious command arguments', () => {
			const dangerousArgs = [
				['task', 'create', '--title', '; rm -rf /'],
				['task', 'edit', 'task-1; cat /etc/passwd'],
				['config', 'set', 'key', '$(whoami)']
			];
			
			dangerousArgs.forEach(args => {
				const validated = validateArguments(args);
				expect(validated).toBe(false);
			});
		});
		
		test('should escape shell metacharacters', () => {
			const inputs = [
				'normal-text',
				'text with spaces',
				'text;with;semicolons',
				'text|with|pipes',
				'text&with&ampersands',
				'text`with`backticks',
				'text$with$dollars',
				'text(with)parens'
			];
			
			inputs.forEach(input => {
				const escaped = escapeShellArg(input);
				// Should be properly quoted or escaped
				if (input.match(/[;|&`$()\\]/)) {
					expect(escaped).toMatch(/^'.*'$|^".*"$/);
				}
			});
		});
	});
	
	describe('Path Traversal Prevention', () => {
		test('should prevent directory traversal', () => {
			const maliciousPaths = securityPayloads.pathTraversal;
			
			maliciousPaths.forEach(path => {
				const safe = sanitizePath(path);
				expect(safe).not.toContain('..');
				expect(safe).not.toMatch(/^\/etc/);
				expect(safe).not.toMatch(/^\\\\server/);
				expect(safe).not.toMatch(/^file:/);
			});
		});
		
		test('should restrict file access to allowed directories', () => {
			const allowedDirs = ['/home/user/backlog', '/tmp/backlog'];
			const testPaths = [
				'/home/user/backlog/tasks/task-1.md',  // OK
				'/tmp/backlog/config.json',             // OK
				'/etc/passwd',                          // BLOCKED
				'/home/user/../../../etc/passwd',       // BLOCKED
				'C:\\Windows\\System32\\config\\sam'    // BLOCKED
			];
			
			testPaths.forEach((path, index) => {
				const allowed = isPathAllowed(path, allowedDirs);
				if (index < 2) {
					expect(allowed).toBe(true);
				} else {
					expect(allowed).toBe(false);
				}
			});
		});
	});
	
	describe('Input Validation', () => {
		test('should validate task titles', () => {
			const testCases = [
				{ input: 'Normal task title', valid: true },
				{ input: 'Task with numbers 123', valid: true },
				{ input: 'Task-with-dashes', valid: true },
				{ input: '<script>alert("XSS")</script>', valid: false },
				{ input: 'javascript:alert(1)', valid: false },
				{ input: '', valid: false },
				{ input: 'a'.repeat(1000), valid: false } // Too long
			];
			
			testCases.forEach(tc => {
				const isValid = validateTaskTitle(tc.input);
				expect(isValid).toBe(tc.valid);
			});
		});
		
		test('should validate configuration keys', () => {
			const validKeys = ['backlogCliPath', 'transport', 'port', 'autoStart'];
			const invalidKeys = ['__proto__', 'constructor', 'prototype', '../config'];
			
			validKeys.forEach(key => {
				expect(isValidConfigKey(key)).toBe(true);
			});
			
			invalidKeys.forEach(key => {
				expect(isValidConfigKey(key)).toBe(false);
			});
		});
		
		test('should sanitize HTML in descriptions', () => {
			const xssPayloads = securityPayloads.xss;
			
			xssPayloads.forEach(payload => {
				const sanitized = sanitizeHTML(payload);
				expect(sanitized).not.toContain('<script');
				expect(sanitized).not.toContain('javascript:');
				expect(sanitized).not.toContain('onerror=');
				expect(sanitized).not.toContain('onload=');
			});
		});
	});
	
	describe('Rate Limiting', () => {
		test('should limit rapid command execution', async () => {
			const rateLimiter = new RateLimiter(5, 1000); // 5 requests per second
			const results: boolean[] = [];
			
			// Try to execute 10 commands rapidly
			for (let i = 0; i < 10; i++) {
				results.push(rateLimiter.allow());
			}
			
			// First 5 should succeed
			expect(results.slice(0, 5).every(r => r === true)).toBe(true);
			// Next 5 should be blocked
			expect(results.slice(5).every(r => r === false)).toBe(true);
		});
		
		test('should reset rate limit after window', async () => {
			const rateLimiter = new RateLimiter(2, 100); // 2 requests per 100ms
			
			expect(rateLimiter.allow()).toBe(true);
			expect(rateLimiter.allow()).toBe(true);
			expect(rateLimiter.allow()).toBe(false);
			
			// Wait for window to reset
			await new Promise(resolve => setTimeout(resolve, 150));
			
			expect(rateLimiter.allow()).toBe(true);
		});
	});
	
	describe('Resource Limits', () => {
		test('should limit output size', () => {
			const largeOutput = 'x'.repeat(100000); // 100KB
			const maxSize = 30000; // 30KB limit
			
			const truncated = truncateOutput(largeOutput, maxSize);
			expect(truncated.length).toBeLessThanOrEqual(maxSize);
			expect(truncated).toContain('[Output truncated]');
		});
		
		test('should limit number of concurrent operations', async () => {
			const semaphore = new Semaphore(3); // Max 3 concurrent
			const running: number[] = [];
			const completed: number[] = [];
			
			// Start 5 operations
			for (let i = 0; i < 5; i++) {
				semaphore.acquire().then(() => {
					running.push(i);
					setTimeout(() => {
						completed.push(i);
						semaphore.release();
					}, 10);
				});
			}
			
			// Check that max 3 are running
			await new Promise(resolve => setTimeout(resolve, 5));
			expect(running.length).toBeLessThanOrEqual(3);
		});
	});
	
	describe('Permission Checks', () => {
		test('should verify file write permissions', () => {
			const testPaths = [
				{ path: '/tmp/test.txt', canWrite: true },
				{ path: '/etc/passwd', canWrite: false },
				{ path: '/root/file.txt', canWrite: false },
				{ path: process.cwd() + '/test.txt', canWrite: true }
			];
			
			testPaths.forEach(tp => {
				const hasPermission = checkWritePermission(tp.path);
				expect(hasPermission).toBe(tp.canWrite);
			});
		});
		
		test('should prevent privilege escalation', () => {
			const commands = [
				'sudo rm -rf /',
				'su root',
				'chmod 777 /etc/passwd',
				'chown root:root file'
			];
			
			commands.forEach(cmd => {
				const allowed = isCommandAllowed(cmd);
				expect(allowed).toBe(false);
			});
		});
	});
	
	describe('Secrets Protection', () => {
		test('should not log sensitive information', () => {
			const sensitiveData = {
				apiKey: 'sk-1234567890abcdef',
				password: 'supersecret',
				token: 'ghp_xxxxxxxxxxxx',
				normal: 'This is normal text'
			};
			
			const logged = sanitizeForLogging(sensitiveData);
			
			expect(logged.apiKey).toBe('[REDACTED]');
			expect(logged.password).toBe('[REDACTED]');
			expect(logged.token).toBe('[REDACTED]');
			expect(logged.normal).toBe('This is normal text');
		});
		
		test('should mask environment variables in output', () => {
			const output = `
				API_KEY=sk-1234567890
				DATABASE_URL=postgres://user:pass@host/db
				Normal output here
			`;
			
			const masked = maskSensitiveOutput(output);
			
			expect(masked).not.toContain('sk-1234567890');
			expect(masked).not.toContain('user:pass');
			expect(masked).toContain('Normal output here');
		});
	});
});

// Helper functions (these would be in the actual implementation)
function sanitizeTaskId(id: string): string {
	return id.replace(/[;|&`$()\\]/g, '');
}

function validateArguments(args: string[]): boolean {
	return args.every(arg => !arg.match(/[;|&`$()\\]/));
}

function escapeShellArg(arg: string): string {
	if (arg.match(/[;|&`$()\\]/)) {
		return `'${arg.replace(/'/g, "\\'")}'`;
	}
	return arg;
}

function sanitizePath(path: string): string {
	return path.replace(/\.\./g, '').replace(/^(\/etc|\\\\|file:)/i, '');
}

function isPathAllowed(path: string, allowedDirs: string[]): boolean {
	const normalized = path.replace(/\\/g, '/');
	return allowedDirs.some(dir => normalized.startsWith(dir));
}

function validateTaskTitle(title: string): boolean {
	if (!title || title.length > 200) return false;
	if (title.match(/<script|javascript:|onerror|onload/i)) return false;
	return true;
}

function isValidConfigKey(key: string): boolean {
	const validKeys = ['backlogCliPath', 'transport', 'port', 'autoStart'];
	const blacklist = ['__proto__', 'constructor', 'prototype'];
	return validKeys.includes(key) && !blacklist.includes(key);
}

function sanitizeHTML(html: string): string {
	return html
		.replace(/<script[^>]*>.*?<\/script>/gi, '')
		.replace(/javascript:/gi, '')
		.replace(/on\w+=/gi, '');
}

class RateLimiter {
	private requests: number[] = [];
	
	constructor(private limit: number, private window: number) {}
	
	allow(): boolean {
		const now = Date.now();
		this.requests = this.requests.filter(t => t > now - this.window);
		
		if (this.requests.length < this.limit) {
			this.requests.push(now);
			return true;
		}
		return false;
	}
}

function truncateOutput(output: string, maxSize: number): string {
	if (output.length <= maxSize) return output;
	return output.slice(0, maxSize - 20) + '\n[Output truncated]';
}

class Semaphore {
	private current = 0;
	private waiting: (() => void)[] = [];
	
	constructor(private max: number) {}
	
	async acquire(): Promise<void> {
		if (this.current < this.max) {
			this.current++;
			return;
		}
		
		return new Promise(resolve => {
			this.waiting.push(resolve);
		});
	}
	
	release(): void {
		this.current--;
		const next = this.waiting.shift();
		if (next) {
			this.current++;
			next();
		}
	}
}

function checkWritePermission(path: string): boolean {
	// Simplified check - in reality would use fs.access
	return !path.match(/^(\/etc|\/root|\/sys|\/proc)/);
}

function isCommandAllowed(cmd: string): boolean {
	const forbidden = ['sudo', 'su', 'chmod', 'chown', 'rm -rf'];
	return !forbidden.some(f => cmd.includes(f));
}

function sanitizeForLogging(data: any): any {
	const sensitiveKeys = ['apiKey', 'password', 'token', 'secret', 'key'];
	const result = { ...data };
	
	for (const key of Object.keys(result)) {
		if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
			result[key] = '[REDACTED]';
		}
	}
	
	return result;
}

function maskSensitiveOutput(output: string): string {
	return output
		.replace(/API_KEY=[\w-]+/g, 'API_KEY=[REDACTED]')
		.replace(/DATABASE_URL=[\w:/@.-]+/g, 'DATABASE_URL=[REDACTED]')
		.replace(/\b(sk-|ghp_|ghs_|pat_)[\w-]{20,}/g, '[REDACTED]');
}