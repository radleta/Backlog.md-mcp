/**
 * Test mock utilities for Backlog.md MCP Server tests
 */

import { mock, spyOn } from 'bun:test';
import type { MockedFunction } from 'bun:test';
import * as fs from 'fs/promises';
import * as path from 'path';
import { spawn } from 'child_process';

/**
 * Mock file system operations
 */
export class MockFileSystem {
	private files: Map<string, string> = new Map();
	
	constructor(initialFiles: Record<string, string> = {}) {
		Object.entries(initialFiles).forEach(([path, content]) => {
			this.files.set(path, content);
		});
	}
	
	async readFile(path: string): Promise<string> {
		if (!this.files.has(path)) {
			throw new Error(`ENOENT: no such file or directory, open '${path}'`);
		}
		return this.files.get(path)!;
	}
	
	async writeFile(path: string, content: string): Promise<void> {
		this.files.set(path, content);
	}
	
	async access(path: string): Promise<void> {
		if (!this.files.has(path) && !this.hasDirectory(path)) {
			throw new Error(`ENOENT: no such file or directory, access '${path}'`);
		}
	}
	
	async mkdir(path: string, options?: any): Promise<void> {
		// Mock mkdir - just mark as created
		this.files.set(path + '/__dir__', '');
	}
	
	private hasDirectory(dirPath: string): boolean {
		return Array.from(this.files.keys()).some(filePath => 
			filePath.startsWith(dirPath + '/')
		);
	}
	
	getFiles(): Map<string, string> {
		return new Map(this.files);
	}
}

/**
 * Mock local MCP configuration
 */
export function mockLocalConfig(exists: boolean = true, configured: boolean = false) {
	const config = configured ? {
		backlogCliPath: '/custom/path/to/backlog'
	} : {};
	
	return exists ? JSON.stringify(config, null, 2) : null;
}

/**
 * Mock child process spawn
 */
export class MockChildProcess extends EventTarget {
	public stdout: MockStream;
	public stderr: MockStream;
	public exitCode: number | null = null;
	
	constructor(
		public command: string,
		public args: string[],
		public options: any = {}
	) {
		super();
		this.stdout = new MockStream();
		this.stderr = new MockStream();
	}
	
	emit(event: string, ...args: any[]) {
		this.dispatchEvent(new CustomEvent(event, { detail: args }));
	}
	
	on(event: string, handler: Function) {
		this.addEventListener(event, (e: any) => handler(...e.detail));
		return this;
	}
	
	kill() {
		this.exitCode = 0;
		this.emit('exit', 0);
	}
	
	mockExit(code: number) {
		this.exitCode = code;
		this.emit('exit', code);
	}
	
	mockError(error: Error) {
		this.emit('error', error);
	}
	
	mockStdout(data: string) {
		this.stdout.emit('data', Buffer.from(data));
	}
	
	mockStderr(data: string) {
		this.stderr.emit('data', Buffer.from(data));
	}
}

class MockStream extends EventTarget {
	emit(event: string, data: Buffer) {
		this.dispatchEvent(new CustomEvent(event, { detail: data }));
	}
	
	on(event: string, handler: Function) {
		this.addEventListener(event, (e: any) => handler(e.detail));
		return this;
	}
}

/**
 * Mock inquirer prompts
 */
export function mockInquirerPrompts(responses: Record<string, any>) {
	return {
		prompt: mock(async (questions: any[]) => {
			const result: Record<string, any> = {};
			for (const q of questions) {
				if (q.name in responses) {
					result[q.name] = responses[q.name];
				} else if (q.default !== undefined) {
					result[q.name] = q.default;
				}
			}
			return result;
		})
	};
}

/**
 * Mock platform for cross-platform testing
 */
export function mockPlatform(platform: 'darwin' | 'win32' | 'linux') {
	const originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform');
	Object.defineProperty(process, 'platform', {
		value: platform,
		configurable: true
	});
	
	return () => {
		if (originalPlatform) {
			Object.defineProperty(process, 'platform', originalPlatform);
		}
	};
}

/**
 * Mock environment variables
 */
export function mockEnv(vars: Record<string, string>) {
	const original = { ...process.env };
	Object.assign(process.env, vars);
	
	return () => {
		process.env = original;
	};
}

/**
 * Mock console output
 */
export class MockConsole {
	public logs: string[] = [];
	public errors: string[] = [];
	public warns: string[] = [];
	
	private originalConsole = {
		log: console.log,
		error: console.error,
		warn: console.warn
	};
	
	start() {
		console.log = (...args: any[]) => {
			this.logs.push(args.join(' '));
		};
		console.error = (...args: any[]) => {
			this.errors.push(args.join(' '));
		};
		console.warn = (...args: any[]) => {
			this.warns.push(args.join(' '));
		};
	}
	
	stop() {
		console.log = this.originalConsole.log;
		console.error = this.originalConsole.error;
		console.warn = this.originalConsole.warn;
	}
	
	clear() {
		this.logs = [];
		this.errors = [];
		this.warns = [];
	}
}

/**
 * Mock MCP server responses
 */
export function mockMCPResponse(type: string, data: any) {
	return {
		jsonrpc: '2.0',
		id: 1,
		result: data
	};
}

/**
 * Create a mock MCP request
 */
export function createMCPRequest(method: string, params: any = {}) {
	return {
		jsonrpc: '2.0',
		id: 1,
		method,
		params
	};
}

/**
 * Mock Backlog.md CLI responses
 */
export const mockBacklogResponses = {
	taskList: `
## Tasks

### TODO
- [task-1] Implement feature A
- [task-2] Fix bug B

### IN PROGRESS
- [task-3] Working on feature C
`,
	taskCreate: 'Created task: task-4 - New task',
	taskEdit: 'Updated task: task-1',
	taskMove: 'Moved task task-1 to done',
	taskDelete: 'Deleted task: task-1',
	boardShow: `
┌─────────────┬─────────────┬─────────────┬─────────────┐
│    TODO     │ IN PROGRESS │    DONE     │   BLOCKED   │
├─────────────┼─────────────┼─────────────┼─────────────┤
│  [task-1]   │  [task-3]   │  [task-5]   │  [task-7]   │
│  Feature A  │  Feature C  │  Feature E  │   Bug Fix   │
│             │             │             │             │
│  [task-2]   │  [task-4]   │  [task-6]   │             │
│   Bug B     │   Task D    │   Task F    │             │
└─────────────┴─────────────┴─────────────┴─────────────┘
`,
	sprintCurrent: `
## Current Sprint: Sprint 1

**Goal:** Complete core features
**Duration:** 2024-01-01 to 2024-01-14

### Tasks
- [task-1] Feature A (TODO)
- [task-3] Feature C (IN PROGRESS)
- [task-5] Feature E (DONE)
`,
	configList: JSON.stringify({
		defaultEditor: 'vim',
		theme: 'dark',
		autoSave: true
	}, null, 2)
};

/**
 * Wait for async operations
 */
export function waitFor(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a test timeout
 */
export function createTimeout(ms: number = 5000) {
	return new Promise((_, reject) => {
		setTimeout(() => reject(new Error('Test timeout')), ms);
	});
}