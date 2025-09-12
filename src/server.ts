#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { spawn } from "child_process";
import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { getBacklogCliPath, isBacklogInitialized } from "./config.js";
import { escapeShellArg, validateArgumentsEnhanced, sanitizePath, isPathAllowed } from "./security.js";

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

// Helper to group tasks by priority (read-only)
async function groupTasksByPriority(): Promise<string> {
  try {
    const priorities = ["high", "medium", "low"];
    let result = "";

    for (const priority of priorities) {
      const tasks = await runBacklogCommand([
        "task",
        "list",
        "--priority",
        priority,
        "--plain",
      ]);
      if (tasks.trim()) {
        result += `## ${priority.charAt(0).toUpperCase() + priority.slice(1)} Priority\n\n`;
        tasks
          .split("\n")
          .filter((line) => line.trim())
          .forEach((task) => {
            result += `- ${task}\n`;
          });
        result += "\n";
      }
    }

    // Add tasks with no priority
    try {
      const allTasks = await runBacklogCommand(["task", "list", "--plain"]);
      const lines = allTasks.split("\n").filter((line) => line.trim());
      const noPriorityTasks = [];

      for (const line of lines) {
        // Check if line contains priority markers
        if (!line.match(/\*#(high|medium|low)\*/)) {
          noPriorityTasks.push(line);
        }
      }

      if (noPriorityTasks.length > 0) {
        result += `## No Priority\n\n`;
        noPriorityTasks.forEach((task) => (result += `- ${task}\n`));
      }
    } catch {
      // Ignore errors for no-priority tasks
    }

    return result || "No tasks found.";
  } catch (error) {
    return `Error grouping tasks by priority: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
}

// Helper to list decision files directly from filesystem (read-only)
async function listDecisionFiles(projectDir: string): Promise<string> {
  try {
    // Sanitize the project directory path
    const sanitizedProjectDir = sanitizePath(projectDir);
    
    // Ensure the path is allowed (within reasonable bounds)
    const allowedDirs = [process.cwd(), process.env.PWD || process.cwd()];
    if (!isPathAllowed(sanitizedProjectDir, allowedDirs)) {
      throw new Error('Access to specified directory is not allowed');
    }

    const decisionsDir = join(sanitizedProjectDir, "backlog", "decisions");
    const files = await readdir(decisionsDir);

    // Filter for decision files (skip readme.md)
    const decisionFiles = files.filter(
      (file) =>
        file.endsWith(".md") &&
        file !== "readme.md" &&
        file.startsWith("decision-")
    );

    if (decisionFiles.length === 0) {
      return "No decision records found.";
    }

    // Read first few lines of each decision to get title and status
    const decisions = await Promise.all(
      decisionFiles.map(async (file) => {
        try {
          const filePath = join(decisionsDir, file);
          const content = await readFile(filePath, "utf-8");
          const lines = content.split("\n");

          // Extract ID from filename (decision-1 -> 1)
          const idMatch = file.match(/decision-(.+?) -/);
          const id = idMatch?.[1] ?? file.replace(".md", "");

          // Extract title from filename or first header
          const titleMatch = file.match(/decision-.+? - (.+)\.md$/);
          const title = titleMatch?.[1]?.replace(/-/g, " ") ?? "Unknown";

          // Look for status in the content
          const statusLine = lines.find((line) =>
            line.toLowerCase().includes("status:")
          );
          const status = statusLine
            ? statusLine.split(":")[1]?.trim() || "Unknown"
            : "Unknown";

          return `**${id}** - ${title} [${status}]`;
        } catch {
          return `**${file}** - Failed to read`;
        }
      })
    );

    return decisions.join("\n");
  } catch (error) {
    return `Error reading decisions: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
}

// Helper to run backlog CLI commands
async function runBacklogCommand(args: string[]): Promise<string> {
  // Use the project directory from Claude (PWD env var)
  const projectDir = process.env.PWD || process.cwd();

  // Check if Backlog.md is initialized in the PROJECT directory
  if (!isBacklogInitialized(projectDir)) {
    throw new Error(
      'Backlog.md is not initialized in the project directory. Please run "backlog init" first.'
    );
  }

  // Validate arguments for security using enhanced validation
  const validation = validateArgumentsEnhanced(args);
  if (!validation.valid) {
    throw new Error(validation.reason || 'Invalid command arguments detected');
  }

  try {
    const backlogPath = await getBacklogCliPath();

    return new Promise((resolve, reject) => {
      const isWindows = process.platform === 'win32';
      
      let executablePath = backlogPath;
      let spawnOptions;
      let argsToUse;
      
      if (isWindows) {
        // On Windows with shell, quote the executable path if it contains spaces
        if (backlogPath.includes(' ') && !backlogPath.startsWith('"')) {
          executablePath = `"${backlogPath}"`;
        }
        spawnOptions = {
          cwd: projectDir,
          env: { ...process.env },
          shell: true, // Use shell on Windows for batch file support
          windowsHide: true
        };
        // Escape arguments when using shell to prevent injection
        argsToUse = args.map(arg => escapeShellArg(arg));
      } else {
        spawnOptions = {
          cwd: projectDir,
          env: { ...process.env },
          shell: false
        };
        // Use raw arguments when shell: false - Node.js handles them safely
        argsToUse = args;
      }
      
      const child = spawn(executablePath, argsToUse, spawnOptions);

      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      child.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      child.on("error", (error) => {
        if (error.message.includes('ENOENT')) {
          reject(new Error(
            `Backlog CLI not found at: ${backlogPath}\n` +
            `Please ensure backlog.md is installed or configure the path using:\n` +
            `backlog-mcp config set backlogCliPath "/path/to/backlog"`
          ));
        } else {
          reject(new Error(`Command failed: ${error.message}`));
        }
      });

      child.on("exit", (code) => {
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
      description:
        "Create new tasks with comprehensive task management features. BEST PRACTICES: Always include acceptance criteria for measurable completion (ac: ['Test passes', 'Documentation updated']), set dependencies for proper execution order (dependencies: 'task-001,task-002'), use parent for sub-tasks (parent: 'task-008'). Example: Create feature task with ac: ['API endpoint works', 'Tests pass'], dependencies: 'task-001', priority: 'high'",
      inputSchema: {
        type: "object",
        properties: {
          title: { type: "string", description: "Task title" },
          description: {
            type: "string",
            description: "Task description (optional)",
          },
          status: {
            type: "string",
            description:
              "Task status (must match your Backlog.md configuration)",
          },
          priority: {
            type: "string",
            enum: ["low", "medium", "high"],
            description: "Task priority (optional)",
          },
          labels: {
            type: "array",
            items: { type: "string" },
            description: "Task labels (optional)",
          },
          assignee: { type: "string", description: "Task assignee (optional)" },
          plan: {
            type: "string",
            description: "Implementation plan (optional)",
          },
          notes: {
            type: "string",
            description: "Implementation notes (optional)",
          },
          ac: {
            type: "array",
            items: { type: "string" },
            description:
              "Acceptance criteria - measurable outcomes that define task completion. Each criterion should be specific and verifiable. Example: ['Unit tests pass', 'Code review approved', 'Documentation updated']",
          },
          dependencies: {
            type: "string",
            description:
              "Task dependencies - comma-separated IDs of tasks that must complete before this task. Creates execution sequences. Example: 'task-001,task-002' means this task depends on completion of tasks 001 and 002",
          },
          parent: {
            type: "string",
            description:
              "Parent task ID for creating sub-tasks in a hierarchy. Sub-tasks help break down complex work. Example: 'task-008' creates this as a sub-task (task-008.01)",
          },
          draft: {
            type: "boolean",
            description: "Create as draft task (optional)",
          },
        },
        required: ["title"],
      },
    },
    {
      name: "task_list",
      description:
        "List tasks with powerful filtering. Use parent parameter to see all sub-tasks of a parent. Combine filters for specific views. Example: List high-priority sub-tasks with parent: 'task-008', priority: 'high', label: 'frontend'",
      inputSchema: {
        type: "object",
        properties: {
          status: {
            type: "string",
            description:
              "Filter by status or 'all' for all tasks (status values must match your Backlog.md configuration)",
          },
          label: { type: "string", description: "Filter by label" },
          priority: {
            type: "string",
            enum: ["low", "medium", "high"],
            description: "Filter by priority",
          },
          assignee: { type: "string", description: "Filter by assignee" },
          parent: { type: "string", description: "Filter by parent task ID" },
          sort: {
            type: "string",
            enum: ["priority", "id"],
            description: "Sort tasks by field",
          },
        },
      },
    },
    {
      name: "task_edit",
      description:
        "Edit existing tasks with full property support. Use checkAc/uncheckAc arrays to mark acceptance criteria complete (checkAc: [1,2]). Add new criteria with ac parameter. Set dependencies to establish task order. Example: Mark criteria done with checkAc: [1,3], add dependency with dependencies: 'task-005,task-006'",
      inputSchema: {
        type: "object",
        properties: {
          taskId: { type: "string", description: "Task ID to edit" },
          title: { type: "string", description: "New title (optional)" },
          description: {
            type: "string",
            description: "New description (optional)",
          },
          status: {
            type: "string",
            description:
              "New status (optional, must match your Backlog.md configuration)",
          },
          priority: {
            type: "string",
            enum: ["low", "medium", "high"],
            description: "New priority (optional)",
          },
          assignee: { type: "string", description: "Task assignee (optional)" },
          plan: {
            type: "string",
            description: "Implementation plan (optional)",
          },
          notes: {
            type: "string",
            description: "Implementation notes (optional)",
          },
          ac: {
            type: "array",
            items: { type: "string" },
            description: "Add acceptance criteria (optional)",
          },
          removeAc: {
            type: "array",
            items: { type: "number" },
            description: "Remove acceptance criteria by index (optional)",
          },
          checkAc: {
            type: "array",
            items: { type: "number" },
            description: "Mark acceptance criteria as done by index (optional)",
          },
          uncheckAc: {
            type: "array",
            items: { type: "number" },
            description:
              "Mark acceptance criteria as not done by index (optional)",
          },
          dependencies: {
            type: "string",
            description: "Comma-separated task dependencies (optional)",
          },
          addLabel: {
            type: "string",
            description: "Add a single label (optional)",
          },
          removeLabel: {
            type: "string",
            description: "Remove a single label (optional)",
          },
          ordinal: {
            type: "number",
            description: "Set task ordinal for custom ordering (optional)",
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
    {
      name: "config_list",
      description: "List all configuration values",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
    {
      name: "draft_create",
      description: "Create a new draft task",
      inputSchema: {
        type: "object",
        properties: {
          title: { type: "string", description: "Draft task title" },
          description: {
            type: "string",
            description: "Draft task description (optional)",
          },
          assignee: { type: "string", description: "Task assignee (optional)" },
          labels: {
            type: "string",
            description: "Comma-separated labels (optional)",
          },
        },
        required: ["title"],
      },
    },
    {
      name: "draft_list",
      description: "List all draft tasks",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
    {
      name: "draft_promote",
      description: "Promote a draft task to a full task",
      inputSchema: {
        type: "object",
        properties: {
          taskId: { type: "string", description: "Draft task ID to promote" },
        },
        required: ["taskId"],
      },
    },
    {
      name: "draft_archive",
      description: "Archive a draft task",
      inputSchema: {
        type: "object",
        properties: {
          taskId: { type: "string", description: "Draft task ID to archive" },
        },
        required: ["taskId"],
      },
    },
    {
      name: "draft_view",
      description: "View a draft task's details",
      inputSchema: {
        type: "object",
        properties: {
          taskId: { type: "string", description: "Draft task ID to view" },
        },
        required: ["taskId"],
      },
    },
    {
      name: "task_demote",
      description: "Demote a task to draft status",
      inputSchema: {
        type: "object",
        properties: {
          taskId: { type: "string", description: "Task ID to demote" },
        },
        required: ["taskId"],
      },
    },
    {
      name: "doc_create",
      description: "Create a new documentation file",
      inputSchema: {
        type: "object",
        properties: {
          title: { type: "string", description: "Document title" },
          path: {
            type: "string",
            description: "Document path (optional, e.g. 'guides/setup')",
          },
          type: {
            type: "string",
            description: "Document type (optional, e.g. 'technical')",
          },
        },
        required: ["title"],
      },
    },
    {
      name: "doc_list",
      description: "List all documentation files",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
    {
      name: "doc_view",
      description: "View a specific documentation file",
      inputSchema: {
        type: "object",
        properties: {
          docId: { type: "string", description: "Document ID to view" },
        },
        required: ["docId"],
      },
    },
    {
      name: "decision_create",
      description: "Create a new decision record",
      inputSchema: {
        type: "object",
        properties: {
          title: { type: "string", description: "Decision title" },
          status: {
            type: "string",
            enum: ["proposed", "accepted", "rejected", "superseded"],
            description: "Decision status (optional)",
          },
        },
        required: ["title"],
      },
    },
    {
      name: "board_export",
      description: "Export Kanban board to markdown file",
      inputSchema: {
        type: "object",
        properties: {
          filename: {
            type: "string",
            description: "Output filename (optional)",
          },
          force: {
            type: "boolean",
            description: "Overwrite existing file without confirmation",
          },
          readme: {
            type: "boolean",
            description: "Export to README.md with markers",
          },
          exportVersion: {
            type: "string",
            description: "Version to include in the export",
          },
        },
      },
    },
    {
      name: "overview",
      description: "Show project overview and statistics",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
    {
      name: "sequence_list",
      description:
        "View task execution sequences based on dependencies. Shows which tasks can run in parallel and which must wait. Essential for understanding workflow order after setting dependencies",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
    {
      name: "decision_list",
      description: "List all decision records",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
    {
      name: "task_dependencies",
      description:
        "View complete dependency graph for a task, showing what it depends on (upstream) and what depends on it (downstream). Use to verify workflow before starting work",
      inputSchema: {
        type: "object",
        properties: {
          taskId: {
            type: "string",
            description: "Task ID to view dependencies for",
          },
        },
        required: ["taskId"],
      },
    },
    {
      name: "task_children",
      description: "List all children of a parent task",
      inputSchema: {
        type: "object",
        properties: {
          taskId: { type: "string", description: "Parent task ID" },
        },
        required: ["taskId"],
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
      uri: "backlog://drafts/all",
      name: "All Draft Tasks",
      description: "View all draft tasks in the backlog",
      mimeType: "text/markdown",
    },
    {
      uri: "backlog://docs/all",
      name: "All Documentation",
      description: "View all documentation files",
      mimeType: "text/markdown",
    },
    {
      uri: "backlog://overview",
      name: "Project Overview",
      description: "Project statistics and overview",
      mimeType: "text/plain",
    },
    {
      uri: "backlog://sequences",
      name: "Task Sequences",
      description: "Execution sequences computed from task dependencies",
      mimeType: "text/plain",
    },
    {
      uri: "backlog://decisions/all",
      name: "All Decision Records",
      description: "View all decision records",
      mimeType: "text/markdown",
    },
    {
      uri: "backlog://tasks/by-priority",
      name: "Tasks by Priority",
      description: "View tasks grouped by priority",
      mimeType: "text/markdown",
    },
    {
      uri: "backlog://statistics",
      name: "Project Statistics",
      description: "Enhanced project statistics and metrics",
      mimeType: "text/plain",
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
    case "backlog://drafts/all": {
      const drafts = await runBacklogCommand(["draft", "list", "--plain"]);
      return {
        contents: [
          {
            uri,
            mimeType: "text/markdown",
            text: drafts,
          },
        ],
      };
    }
    case "backlog://docs/all": {
      const docs = await runBacklogCommand(["doc", "list", "--plain"]);
      return {
        contents: [
          {
            uri,
            mimeType: "text/markdown",
            text: docs,
          },
        ],
      };
    }
    case "backlog://overview": {
      const overview = await runBacklogCommand(["overview"]);
      return {
        contents: [
          {
            uri,
            mimeType: "text/plain",
            text: overview,
          },
        ],
      };
    }
    case "backlog://sequences": {
      const sequences = await runBacklogCommand([
        "sequence",
        "list",
        "--plain",
      ]);
      return {
        contents: [
          {
            uri,
            mimeType: "text/plain",
            text: sequences,
          },
        ],
      };
    }
    case "backlog://decisions/all": {
      const projectDir = process.env.PWD || process.cwd();
      const decisions = await listDecisionFiles(projectDir);
      return {
        contents: [
          {
            uri,
            mimeType: "text/markdown",
            text: decisions,
          },
        ],
      };
    }
    case "backlog://tasks/by-priority": {
      const tasks = await groupTasksByPriority();
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
    case "backlog://statistics": {
      // Enhanced statistics combining overview with additional metrics
      const overview = await runBacklogCommand(["overview"]);
      const allTasks = await runBacklogCommand(["task", "list", "--plain"]);

      // Add some basic analytics
      let enhancedStats = overview + "\n\n## Additional Metrics\n\n";

      const taskLines = allTasks.split("\n").filter((line) => line.trim());
      enhancedStats += `Total Tasks Listed: ${taskLines.length}\n`;

      // Count by status (basic parsing)
      const todoTasks = taskLines.filter((line) =>
        line.includes("To Do")
      ).length;
      const inProgressTasks = taskLines.filter((line) =>
        line.includes("In Progress")
      ).length;
      const doneTasks = taskLines.filter((line) =>
        line.includes("Done")
      ).length;

      enhancedStats += `- To Do: ${todoTasks}\n`;
      enhancedStats += `- In Progress: ${inProgressTasks}\n`;
      enhancedStats += `- Done: ${doneTasks}\n`;

      return {
        contents: [
          {
            uri,
            mimeType: "text/plain",
            text: enhancedStats,
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
        if (args.assignee) cmdArgs.push("--assignee", args.assignee);
        if (args.plan) cmdArgs.push("--plan", args.plan);
        if (args.notes) cmdArgs.push("--notes", args.notes);
        if (args.dependencies) cmdArgs.push("--dep", args.dependencies);
        if (args.parent) cmdArgs.push("--parent", args.parent);
        if (args.draft) cmdArgs.push("--draft");
        if (args.labels && args.labels.length > 0) {
          cmdArgs.push("--labels", args.labels.join(","));
        }
        if (args.ac && args.ac.length > 0) {
          args.ac.forEach((criterion: string) => {
            cmdArgs.push("--ac", criterion);
          });
        }
        const result = await runBacklogCommand(cmdArgs);
        return { content: [{ type: "text", text: result }] };
      }

      case "task_list": {
        const cmdArgs = ["task", "list", "--plain"];
        if (args.status && args.status !== "all")
          cmdArgs.push("--status", args.status);
        if (args.priority) cmdArgs.push("--priority", args.priority);
        if (args.assignee) cmdArgs.push("--assignee", args.assignee);
        if (args.parent) cmdArgs.push("--parent", args.parent);
        if (args.sort) cmdArgs.push("--sort", args.sort);

        let result = await runBacklogCommand(cmdArgs);

        // Client-side label filtering (MCP enhancement)
        if (args.label) {
          const lines = result.split("\n");
          const filteredLines: string[] = [];

          // Parse task list and filter by checking each task individually
          for (const line of lines) {
            // Keep section headers and empty lines
            if (
              line.trim() === "" ||
              line.endsWith(":") ||
              !line.includes("task-")
            ) {
              filteredLines.push(line);
              continue;
            }

            // Extract task ID from the line like "[HIGH] task-010 - Test labels functionality"
            const taskMatch = line.match(/task-(\d+(?:\.\d+)*)/);
            if (taskMatch) {
              const taskId = taskMatch[0];
              try {
                // Get full task details to check labels
                const taskResult = await runBacklogCommand([
                  "task",
                  "view",
                  taskId,
                  "--plain",
                ]);
                const labelsMatch = taskResult.match(/Labels:\s*(.+)/i);
                if (labelsMatch && labelsMatch[1]) {
                  const labels = labelsMatch[1]
                    .split(",")
                    .map((l) => l.trim().toLowerCase());
                  if (labels.includes(args.label.toLowerCase())) {
                    filteredLines.push(line);
                  }
                }
              } catch {
                // If we can't get task details, skip it
                continue;
              }
            }
          }
          result = filteredLines.join("\n");
        }

        return { content: [{ type: "text", text: result }] };
      }

      case "task_edit": {
        const cmdArgs = ["task", "edit", args.taskId, "--plain"];
        if (args.title) cmdArgs.push("--title", args.title);
        if (args.description) cmdArgs.push("--description", args.description);
        if (args.status) cmdArgs.push("--status", args.status);
        if (args.priority) cmdArgs.push("--priority", args.priority);
        if (args.assignee) cmdArgs.push("--assignee", args.assignee);
        if (args.plan) cmdArgs.push("--plan", args.plan);
        if (args.notes) cmdArgs.push("--notes", args.notes);
        if (args.dependencies) cmdArgs.push("--dep", args.dependencies);
        if (args.ordinal) cmdArgs.push("--ordinal", args.ordinal.toString());
        if (args.addLabel) cmdArgs.push("--add-label", args.addLabel);
        if (args.removeLabel) cmdArgs.push("--remove-label", args.removeLabel);
        if (args.ac && args.ac.length > 0) {
          args.ac.forEach((criterion: string) => {
            cmdArgs.push("--ac", criterion);
          });
        }
        if (args.removeAc && args.removeAc.length > 0) {
          args.removeAc.forEach((index: number) => {
            cmdArgs.push("--remove-ac", index.toString());
          });
        }
        if (args.checkAc && args.checkAc.length > 0) {
          args.checkAc.forEach((index: number) => {
            cmdArgs.push("--check-ac", index.toString());
          });
        }
        if (args.uncheckAc && args.uncheckAc.length > 0) {
          args.uncheckAc.forEach((index: number) => {
            cmdArgs.push("--uncheck-ac", index.toString());
          });
        }
        const result = await runBacklogCommand(cmdArgs);
        return { content: [{ type: "text", text: result }] };
      }

      case "task_view": {
        const result = await runBacklogCommand([
          "task",
          "view",
          args.taskId,
          "--plain",
        ]);
        return { content: [{ type: "text", text: result }] };
      }

      case "task_archive": {
        const result = await runBacklogCommand([
          "task",
          "archive",
          args.taskId,
        ]);
        return { content: [{ type: "text", text: result }] };
      }

      case "board_show": {
        const result = await runBacklogCommand(["board", "view"]);
        return { content: [{ type: "text", text: result }] };
      }

      case "config_get": {
        // Only validate against dangerous keys that could cause prototype pollution
        if (args.key.includes('__proto__') || args.key.includes('constructor') || args.key.includes('prototype')) {
          throw new Error(`Invalid configuration key: ${args.key}`);
        }
        const result = await runBacklogCommand(["config", "get", args.key]);
        return { content: [{ type: "text", text: result }] };
      }

      case "config_set": {
        // Only validate against dangerous keys that could cause prototype pollution
        if (args.key.includes('__proto__') || args.key.includes('constructor') || args.key.includes('prototype')) {
          throw new Error(`Invalid configuration key: ${args.key}`);
        }
        const result = await runBacklogCommand([
          "config",
          "set",
          args.key,
          args.value,
        ]);
        return { content: [{ type: "text", text: result }] };
      }

      case "config_list": {
        const result = await runBacklogCommand(["config", "list"]);
        return { content: [{ type: "text", text: result }] };
      }

      case "draft_create": {
        const cmdArgs = ["draft", "create", args.title];
        if (args.description) cmdArgs.push("--description", args.description);
        if (args.assignee) cmdArgs.push("--assignee", args.assignee);
        if (args.labels) cmdArgs.push("--labels", args.labels);
        const result = await runBacklogCommand(cmdArgs);
        return { content: [{ type: "text", text: result }] };
      }

      case "draft_list": {
        const result = await runBacklogCommand(["draft", "list", "--plain"]);
        return { content: [{ type: "text", text: result }] };
      }

      case "draft_promote": {
        const result = await runBacklogCommand([
          "draft",
          "promote",
          args.taskId,
        ]);
        return { content: [{ type: "text", text: result }] };
      }

      case "draft_archive": {
        const result = await runBacklogCommand([
          "draft",
          "archive",
          args.taskId,
        ]);
        return { content: [{ type: "text", text: result }] };
      }

      case "draft_view": {
        const result = await runBacklogCommand([
          "draft",
          "view",
          args.taskId,
          "--plain",
        ]);
        return { content: [{ type: "text", text: result }] };
      }

      case "task_demote": {
        const result = await runBacklogCommand(["task", "demote", args.taskId]);
        return { content: [{ type: "text", text: result }] };
      }

      case "doc_create": {
        const cmdArgs = ["doc", "create", args.title];
        if (args.path) cmdArgs.push("--path", args.path);
        if (args.type) cmdArgs.push("--type", args.type);
        const result = await runBacklogCommand(cmdArgs);
        return { content: [{ type: "text", text: result }] };
      }

      case "doc_list": {
        const result = await runBacklogCommand(["doc", "list", "--plain"]);
        return { content: [{ type: "text", text: result }] };
      }

      case "doc_view": {
        const result = await runBacklogCommand(["doc", "view", args.docId]);
        return { content: [{ type: "text", text: result }] };
      }

      case "decision_create": {
        const cmdArgs = ["decision", "create", args.title];
        if (args.status) cmdArgs.push("--status", args.status);
        const result = await runBacklogCommand(cmdArgs);
        return { content: [{ type: "text", text: result }] };
      }

      case "board_export": {
        const cmdArgs = ["board", "export"];
        if (args.filename) cmdArgs.push(args.filename);
        if (args.force) cmdArgs.push("--force");
        if (args.readme) cmdArgs.push("--readme");
        if (args.exportVersion)
          cmdArgs.push("--export-version", args.exportVersion);
        const result = await runBacklogCommand(cmdArgs);
        return { content: [{ type: "text", text: result }] };
      }

      case "overview": {
        const result = await runBacklogCommand(["overview"]);
        return { content: [{ type: "text", text: result }] };
      }

      case "sequence_list": {
        const result = await runBacklogCommand(["sequence", "list", "--plain"]);
        return { content: [{ type: "text", text: result }] };
      }

      case "decision_list": {
        const projectDir = process.env.PWD || process.cwd();
        const result = await listDecisionFiles(projectDir);
        return { content: [{ type: "text", text: result }] };
      }

      case "task_dependencies": {
        const taskResult = await runBacklogCommand([
          "task",
          "view",
          args.taskId,
          "--plain",
        ]);

        // Look for Dependencies: line
        const lines = taskResult.split("\n");
        const depLine = lines.find((line) => line.startsWith("Dependencies:"));

        if (depLine && depLine.length > "Dependencies:".length) {
          const deps = depLine.substring("Dependencies:".length).trim();
          return {
            content: [{ type: "text", text: `**Dependencies:** ${deps}` }],
          };
        }

        return {
          content: [
            { type: "text", text: `Task ${args.taskId} has no dependencies.` },
          ],
        };
      }

      case "task_children": {
        // Use task list with parent filter to get children
        const result = await runBacklogCommand([
          "task",
          "list",
          "--parent",
          args.taskId,
          "--plain",
        ]);
        return {
          content: [
            {
              type: "text",
              text: result || `No child tasks found for ${args.taskId}.`,
            },
          ],
        };
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

  // STDIO transport
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Server is now running and listening for MCP protocol messages
}

// Export server as default
export default server;
