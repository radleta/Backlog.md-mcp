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
import { getBacklogCliPath } from './config.js';

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
	try {
		const backlogPath = await getBacklogCliPath();
		
		return new Promise((resolve, reject) => {
			const child = spawn(backlogPath, args, {
				shell: true,
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
						enum: ["todo", "in-progress", "done", "blocked"],
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
						enum: ["todo", "in-progress", "done", "blocked", "all"],
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
						enum: ["todo", "in-progress", "done", "blocked"],
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
			name: "task_move",
			description: "Move a task to a different status",
			inputSchema: {
				type: "object",
				properties: {
					taskId: { type: "string", description: "Task ID to move" },
					status: {
						type: "string",
						enum: ["todo", "in-progress", "done", "blocked"],
						description: "Target status",
					},
				},
				required: ["taskId", "status"],
			},
		},
		{
			name: "task_delete",
			description: "Delete a task",
			inputSchema: {
				type: "object",
				properties: {
					taskId: { type: "string", description: "Task ID to delete" },
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
			name: "sprint_create",
			description: "Create a new sprint",
			inputSchema: {
				type: "object",
				properties: {
					name: { type: "string", description: "Sprint name" },
					goal: { type: "string", description: "Sprint goal (optional)" },
					startDate: { type: "string", description: "Start date (YYYY-MM-DD)" },
					endDate: { type: "string", description: "End date (YYYY-MM-DD)" },
				},
				required: ["name", "startDate", "endDate"],
			},
		},
		{
			name: "sprint_current",
			description: "Show the current sprint details",
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
		{
			uri: "backlog://sprint/current",
			name: "Current Sprint",
			description: "Details of the current sprint",
			mimeType: "text/markdown",
		},
	],
}));

// Handle resource reading
server.setRequestHandler(ReadResourceRequestSchema, async (request: any) => {
	const { uri } = request.params;

	switch (uri) {
		case "backlog://tasks/all": {
			const tasks = await runBacklogCommand(["task", "list", "--all"]);
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
			const board = await runBacklogCommand(["board", "show"]);
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
		case "backlog://sprint/current": {
			const sprint = await runBacklogCommand(["sprint", "current"]);
			return {
				contents: [
					{
						uri,
						mimeType: "text/markdown",
						text: sprint,
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
				const cmdArgs = ["task", "create", "--title", args.title];
				if (args.description) cmdArgs.push("--description", args.description);
				if (args.status) cmdArgs.push("--status", args.status);
				if (args.priority) cmdArgs.push("--priority", args.priority);
				if (args.tags) {
					for (const tag of args.tags) {
						cmdArgs.push("--tag", tag);
					}
				}
				const result = await runBacklogCommand(cmdArgs);
				return { content: [{ type: "text", text: result }] };
			}

			case "task_list": {
				const cmdArgs = ["task", "list"];
				if (args.status && args.status !== "all") cmdArgs.push("--status", args.status);
				if (args.tag) cmdArgs.push("--tag", args.tag);
				if (args.priority) cmdArgs.push("--priority", args.priority);
				const result = await runBacklogCommand(cmdArgs);
				return { content: [{ type: "text", text: result }] };
			}

			case "task_edit": {
				const cmdArgs = ["task", "edit", args.taskId];
				if (args.title) cmdArgs.push("--title", args.title);
				if (args.description) cmdArgs.push("--description", args.description);
				if (args.status) cmdArgs.push("--status", args.status);
				if (args.priority) cmdArgs.push("--priority", args.priority);
				const result = await runBacklogCommand(cmdArgs);
				return { content: [{ type: "text", text: result }] };
			}

			case "task_move": {
				const result = await runBacklogCommand(["task", "move", args.taskId, args.status]);
				return { content: [{ type: "text", text: result }] };
			}

			case "task_delete": {
				const result = await runBacklogCommand(["task", "delete", args.taskId, "--force"]);
				return { content: [{ type: "text", text: result }] };
			}

			case "board_show": {
				const result = await runBacklogCommand(["board", "show"]);
				return { content: [{ type: "text", text: result }] };
			}

			case "sprint_create": {
				const cmdArgs = [
					"sprint",
					"create",
					"--name",
					args.name,
					"--start",
					args.startDate,
					"--end",
					args.endDate,
				];
				if (args.goal) cmdArgs.push("--goal", args.goal);
				const result = await runBacklogCommand(cmdArgs);
				return { content: [{ type: "text", text: result }] };
			}

			case "sprint_current": {
				const result = await runBacklogCommand(["sprint", "current"]);
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

// Start the server if run directly
async function main() {
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
		// Don't output anything to avoid interfering with MCP protocol
	}
}

// Only run main if this is the entry point
if (import.meta.url === `file://${process.argv[1]}`) {
	main().catch((error) => {
		console.error("Server error:", error);
		process.exit(1);
	});
}

export default server;