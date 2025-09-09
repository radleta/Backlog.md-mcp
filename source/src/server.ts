#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
	CallToolRequestSchema,
	ListResourcesRequestSchema,
	ListToolsRequestSchema,
	ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { spawn } from 'child_process';
import { getBacklogCliPath, isBacklogInitialized } from './config.js';

// Initialize MCP server
export const server = new Server(
	{
		name: "backlog-md",
		version: "1.0.0",
	},
	{
		capabilities: {
			tools: {},
			resources: {},
		},
	}
);

// Helper to run backlog CLI commands
async function runBacklogCommand(args: string[]): Promise<string> {
	// Use the project directory from Claude (PWD env var)
	const projectDir = process.env.PWD || process.cwd();
	
	// Check if Backlog.md is initialized in the PROJECT directory
	if (!isBacklogInitialized(projectDir)) {
		throw new Error('Backlog.md is not initialized in the project directory. Please run "backlog init" first.');
	}
	
	try {
		const backlogPath = await getBacklogCliPath();
		
		return new Promise((resolve, reject) => {
			const child = spawn(backlogPath, args, {
				shell: false,  // Don't use shell to avoid argument parsing issues
				cwd: projectDir,  // Run command in project directory
				env: { ...process.env }
			});
			
			let stdout = '';
			let stderr = '';
			
			child.stdout.on('data', (data) => {
				stdout += data.toString();
			});
			
			child.stderr.on('data', (data) => {
				stderr += data.toString();
			});
			
			child.on('error', (error) => {
				reject(new Error(`Command failed: ${error.message}`));
			});
			
			child.on('exit', (code) => {
				if (code !== 0) {
					reject(new Error(`Command failed with exit code ${code}: ${stderr}`));
				} else {
					resolve(stdout);
				}
			});
		});
	} catch (error: any) {
		throw new Error(`Command failed: ${error.message}`);
	}
}

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
	tools: [
		{
			name: "task_create",
			description: "Create a new task in backlog",
			inputSchema: {
				type: "object",
				properties: {
					title: { type: "string", description: "Task title" },
					description: { type: "string", description: "Task description (optional)" },
					status: {
						type: "string",
						enum: ["To Do", "In Progress", "Done"],
						description: "Task status",
					},
					priority: {
						type: "string",
						enum: ["low", "medium", "high", "urgent"],
						description: "Task priority (optional)",
					},
					tags: {
						type: "array",
						items: { type: "string" },
						description: "Task tags (optional)",
					},
				},
				required: ["title"],
			},
		},
		{
			name: "task_list",
			description: "List all tasks with optional filtering",
			inputSchema: {
				type: "object",
				properties: {
					status: {
						type: "string",
						enum: ["To Do", "In Progress", "Done", "all"],
						description: "Filter by status",
					},
					tag: { type: "string", description: "Filter by tag" },
					priority: {
						type: "string",
						enum: ["low", "medium", "high", "urgent"],
						description: "Filter by priority",
					},
				},
			},
		},
		{
			name: "task_edit",
			description: "Edit an existing task",
			inputSchema: {
				type: "object",
				properties: {
					taskId: { type: "string", description: "Task ID to edit" },
					title: { type: "string", description: "New title (optional)" },
					description: { type: "string", description: "New description (optional)" },
					status: {
						type: "string",
						enum: ["To Do", "In Progress", "Done"],
						description: "New status (optional)",
					},
					priority: {
						type: "string",
						enum: ["low", "medium", "high", "urgent"],
						description: "New priority (optional)",
					},
				},
				required: ["taskId"],
			},
		},
		{
			name: "task_view",
			description: "View a task's details",
			inputSchema: {
				type: "object",
				properties: {
					taskId: { type: "string", description: "Task ID to view" },
				},
				required: ["taskId"],
			},
		},
		{
			name: "task_archive",
			description: "Archive a task",
			inputSchema: {
				type: "object",
				properties: {
					taskId: { type: "string", description: "Task ID to archive" },
				},
				required: ["taskId"],
			},
		},
		{
			name: "board_show",
			description: "Show the Kanban board",
			inputSchema: {
				type: "object",
				properties: {},
			},
		},
		{
			name: "config_get",
			description: "Get configuration value",
			inputSchema: {
				type: "object",
				properties: {
					key: { type: "string", description: "Configuration key to get" },
				},
				required: ["key"],
			},
		},
		{
			name: "config_set",
			description: "Set configuration value",
			inputSchema: {
				type: "object",
				properties: {
					key: { type: "string", description: "Configuration key" },
					value: { type: "string", description: "Configuration value" },
				},
				required: ["key", "value"],
			},
		},
	],
}));

// Define available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
	resources: [
		{
			uri: "backlog://tasks/all",
			name: "All Tasks",
			description: "View all tasks in the backlog",
			mimeType: "text/markdown",
		},
		{
			uri: "backlog://board",
			name: "Kanban Board",
			description: "Current Kanban board view",
			mimeType: "text/plain",
		},
		{
			uri: "backlog://config",
			name: "Configuration",
			description: "Current backlog configuration",
			mimeType: "application/json",
		},
	],
}));

// Handle resource reading
server.setRequestHandler(ReadResourceRequestSchema, async (request: any) => {
	const { uri } = request.params;

	switch (uri) {
		case "backlog://tasks/all": {
			const tasks = await runBacklogCommand(["task", "list", "--plain"]);
			return {
				contents: [
					{
						uri,
						mimeType: "text/markdown",
						text: tasks,
					},
				],
			};
		}
		case "backlog://board": {
			const board = await runBacklogCommand(["board", "view"]);
			return {
				contents: [
					{
						uri,
						mimeType: "text/plain",
						text: board,
					},
				],
			};
		}
		case "backlog://config": {
			const config = await runBacklogCommand(["config", "list"]);
			return {
				contents: [
					{
						uri,
						mimeType: "application/json",
						text: config,
					},
				],
			};
		}
		default:
			throw new Error(`Unknown resource: ${uri}`);
	}
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
	const { name, arguments: args } = request.params;

	try {
		switch (name) {
			case "task_create": {
				const cmdArgs = ["task", "create", args.title, "--plain"];
				if (args.description) cmdArgs.push("--description", args.description);
				if (args.status) cmdArgs.push("--status", args.status);
				if (args.priority) cmdArgs.push("--priority", args.priority);
				if (args.tags && args.tags.length > 0) {
					cmdArgs.push("--labels", args.tags.join(","));
				}
				const result = await runBacklogCommand(cmdArgs);
				return { content: [{ type: "text", text: result }] };
			}

			case "task_list": {
				const cmdArgs = ["task", "list", "--plain"];
				if (args.status && args.status !== "all") cmdArgs.push("--status", args.status);
				if (args.tag) cmdArgs.push("--labels", args.tag);
				if (args.priority) cmdArgs.push("--priority", args.priority);
				const result = await runBacklogCommand(cmdArgs);
				return { content: [{ type: "text", text: result }] };
			}

			case "task_edit": {
				const cmdArgs = ["task", "edit", args.taskId, "--plain"];
				if (args.title) cmdArgs.push("--title", args.title);
				if (args.description) cmdArgs.push("--description", args.description);
				if (args.status) cmdArgs.push("--status", args.status);
				if (args.priority) cmdArgs.push("--priority", args.priority);
				const result = await runBacklogCommand(cmdArgs);
				return { content: [{ type: "text", text: result }] };
			}

			case "task_view": {
				const result = await runBacklogCommand(["task", "view", args.taskId, "--plain"]);
				return { content: [{ type: "text", text: result }] };
			}

			case "task_archive": {
				const result = await runBacklogCommand(["task", "archive", args.taskId]);
				return { content: [{ type: "text", text: result }] };
			}

			case "board_show": {
				const result = await runBacklogCommand(["board", "view"]);
				return { content: [{ type: "text", text: result }] };
			}


			case "config_get": {
				const result = await runBacklogCommand(["config", "get", args.key]);
				return { content: [{ type: "text", text: result }] };
			}

			case "config_set": {
				const result = await runBacklogCommand(["config", "set", args.key, args.value]);
				return { content: [{ type: "text", text: result }] };
			}

			default:
				throw new Error(`Unknown tool: ${name}`);
		}
	} catch (error: any) {
		return {
			content: [
				{
					type: "text",
					text: `Error: ${error.message}`,
				},
			],
			isError: true,
		};
	}
});

// Start the server
export async function startServer() {
	// Don't check initialization here - let the server start
	// Individual commands will handle initialization checks
	
	const args = process.argv.slice(2);
	const isHttp = args.includes('--http');
	
	if (isHttp) {
		// HTTP transport not implemented in this example
		console.error('HTTP transport not yet implemented. Use STDIO transport.');
		process.exit(1);
	} else {
		// STDIO transport
		const transport = new StdioServerTransport();
		await server.connect(transport);
		// Server is now running and listening for MCP protocol messages
	}
}

// Export server as default
export default server;