# Backlog.md MCP Server

An MCP (Model Context Protocol) server that wraps [Backlog.md](https://github.com/MrLesk/Backlog.md) task management system, enabling AI assistants like Claude to directly manage tasks and view Kanban boards.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Usage](#usage)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)
- [Related Projects](#related-projects)
- [Support](#support)

## Features

### 🛠️ Available Tools

- **Task Management**
  - `task_create` - Create new tasks with full support for title, description, status, priority, labels, assignee, plan, notes, acceptance criteria, dependencies, parent tasks, and draft mode
  - `task_list` - List tasks with enhanced filtering by status, label, priority, assignee, parent task ID, and sorting options (priority, id)
  - `task_edit` - Edit existing tasks with comprehensive support for all task properties, acceptance criteria management (add/remove/check/uncheck), label management, and custom ordering
  - `task_view` - View detailed task information
  - `task_archive` - Archive tasks
  - `task_demote` - Demote tasks to draft status
  - `task_dependencies` - View dependency graph for a specific task
  - `task_children` - List all children of a parent task

- **Draft Management**
  - `draft_create` - Create draft tasks with title, description, assignee, and labels
  - `draft_list` - List all draft tasks
  - `draft_promote` - Promote draft tasks to full tasks
  - `draft_archive` - Archive draft tasks
  - `draft_view` - View draft task details

- **Documentation**
  - `doc_create` - Create documentation files with optional path and type
  - `doc_list` - List all documentation files
  - `doc_view` - View specific documentation files

- **Decision Records**
  - `decision_create` - Create decision records with status (proposed/accepted/rejected/superseded)
  - `decision_list` - List all decision records with titles and status

- **Board & Project Management**
  - `board_show` - Display the Kanban board
  - `board_export` - Export Kanban board to markdown with options for custom filename, force overwrite, README integration, and version tagging
  - `overview` - Show project statistics and overview
  - `cleanup` - Move old completed tasks to archive folder
  - `sequence_list` - List execution sequences computed from task dependencies

- **Configuration**
  - `config_get` - Get specific configuration values
  - `config_set` - Set configuration values
  - `config_list` - List all configuration values

- **Web Interface & Utilities**
  - `browser` - Launch web interface with optional port and browser settings
  - `agents_update` - Update agent instruction files (.cursorrules, CLAUDE.md, AGENTS.md, etc.)

## Design Philosophy

The Backlog.md MCP Server is a reliable wrapper around the Backlog.md CLI that exposes all available commands through the MCP interface while adding useful enhancements for AI assistants.

## Security

The MCP server implements comprehensive security measures including input validation, command injection prevention, and path traversal protection to keep your projects safe.

## Key Features

Beyond the standard Backlog.md functionality, this MCP server adds:

- **Enhanced Filtering**: Filter tasks by labels, priority, and status
- **Task Grouping**: View tasks organized by priority levels
- **Rich Resources**: Access tasks, boards, and statistics via `backlog://` URLs
- **Decision Records**: Create and list architectural decision records
- **Full CLI Access**: All native Backlog.md commands available through natural language

### 📚 Available Resources

Access project data through `backlog://` URLs:

- `backlog://tasks/all` - View all tasks in markdown format
- `backlog://tasks/by-priority` - Tasks grouped by priority levels
- `backlog://board` - Current Kanban board view
- `backlog://drafts/all` - View all draft tasks in markdown format
- `backlog://docs/all` - View all documentation files
- `backlog://decisions/all` - View all decision records
- `backlog://sequences` - Execution sequences computed from task dependencies
- `backlog://overview` - Project statistics and overview
- `backlog://statistics` - Enhanced project statistics and metrics
- `backlog://config` - Configuration settings

## Prerequisites

Before using the MCP server, ensure:

1. **Node.js 18+**: Required for running the MCP server
2. **Backlog.md is installed**: The MCP server requires the [Backlog.md CLI](https://github.com/MrLesk/Backlog.md) to be available
3. **Project initialization**: Your project must have Backlog.md initialized (`backlog init`)
4. **Working directory**: The MCP server runs commands in the directory where Claude is working

### Important Notes

- **Status values**: Must match your Backlog.md configuration exactly (check with `backlog config get statuses`)
- **Non-interactive mode**: The MCP server automatically uses `--plain` flags to prevent interactive prompts
- **Labels**: Use the `labels` parameter in MCP commands, which maps to `--labels` in the CLI

### Limitations

- **Initialization**: The `backlog init` command cannot be implemented through MCP as it requires interactive user input. Projects must be initialized manually before using the MCP server.
- **Interactive Commands**: Any Backlog.md commands that require user interaction are not available through the MCP interface.

### Key Tool Parameters

Common parameters across tools:

- **taskId**: Task identifier format (e.g., "task-123", "task-001.01" for sub-tasks)
- **status**: Must match your Backlog.md configuration exactly (check with `backlog config get statuses`)
- **priority**: "low", "medium", or "high"
- **labels**: Array of strings for task categorization
- **dependencies**: Comma-separated task IDs (e.g., "task-001,task-002")
- **parent**: Parent task ID for creating sub-tasks
- **ac**: Acceptance criteria as array of strings

### Essential Tools Reference

- **task_create**: Create tasks with full support for title, description, status, priority, labels, assignee, plan, notes, acceptance criteria, dependencies, and parent tasks
- **task_list**: List and filter tasks by status, label, priority, assignee, or parent task
- **task_edit**: Comprehensive editing including acceptance criteria management (add/remove/check/uncheck)
- **draft_create/promote**: Create and promote draft tasks to full tasks
- **board_show/export**: Display and export Kanban boards
- **config_get/set**: Manage configuration settings

> For complete tool documentation with all parameters, see the [GitHub repository](https://github.com/radleta/Backlog.md-mcp).

## Installation

### From npm

```bash
npm install -g @radleta/backlog-md-mcp
```


## Quick Start

Get up and running with Backlog.md MCP Server in 3 steps:

1. **Install the package**:
   ```bash
   npm install -g @radleta/backlog-md-mcp
   ```

2. **Add to Claude Code**:
   ```bash
   claude mcp add backlog-md -- backlog-mcp start
   ```

3. **Start using it with Claude**:
   ```
   "Create a high-priority task for implementing user authentication"
   "Show me all tasks with status 'In Progress'"  
   "Display the Kanban board"
   ```

**Prerequisites**: Ensure you have [Backlog.md CLI](https://github.com/MrLesk/Backlog.md) installed and your project initialized with `backlog init`.

For detailed configuration options, see the [Configuration](#configuration) section below.

## Configuration

### Setup Options

```bash
# Add to Claude Code (user scope - available in all projects)
claude mcp add backlog-md --scope user -- backlog-mcp start

# Or add for current project only
claude mcp add backlog-md --scope project -- backlog-mcp start
```

## Usage

### CLI Commands

```bash
# Start the MCP server
backlog-mcp start

# Interactive setup
backlog-mcp setup

# Show server information
backlog-mcp info

# Manage configuration
backlog-mcp config get <key>
backlog-mcp config set <key> <value>

# Validate setup
backlog-mcp validate
```

### Using with Claude

Once configured, you can use natural language in Claude:

- "Create a high-priority task for implementing user authentication"
- "Show me all tasks with status 'In Progress'"
- "Edit task-123 to change its status to 'Done'"
- "View the details of task-456"
- "Display the Kanban board"
- "Archive task-789"
- "Get the current project configuration"




## Troubleshooting

### Windows PowerShell Issues

#### MCP Server Fails with ENOENT Error
**Problem**: MCP functions fail with `spawn ... ENOENT` error when Claude Code is launched from PowerShell.

**Solution**: 
1. **Automatic Detection (v0.1.5+)**: The MCP server now automatically detects the backlog CLI path across different environments.

2. **Manual Configuration** (if auto-detection fails):
   ```bash
   # Find your backlog installation
   where backlog

   # Configure the path (use the .cmd version on Windows)  
   backlog-mcp config set backlogCliPath "C:\Program Files\nodejs\backlog.cmd"
   
   # Verify the configuration
   backlog-mcp validate
   ```

3. **Path Detection Diagnosis**:
   ```bash
   # See what paths are being detected
   backlog-mcp detect
   ```

### Server Not Connecting
- Ensure `backlog-mcp` is in your PATH
- Run `backlog-mcp validate` to check setup

### Commands Failing
- Ensure you have a valid Backlog.md repository initialized (`backlog init`)
- Check that you're in the correct project directory
- Verify the Backlog.md CLI works: `backlog --help`
- Ensure status values match your Backlog.md configuration exactly (check with `backlog config get statuses`)

### Commands Hanging or No Response
- This typically means the CLI is waiting for interactive input
- The MCP server should automatically use `--plain` flags to prevent this
- Check that you're using the latest version of the MCP server

### Debugging
- Use verbose mode: `backlog-mcp start --verbose`
- Run `backlog-mcp info` to see server capabilities
- Use `backlog-mcp detect` to diagnose path resolution issues

## Contributing

To contribute to this project, see the [GitHub repository](https://github.com/radleta/Backlog.md-mcp) for development setup, testing procedures, and contribution guidelines.

## License

MIT License - See LICENSE file for details

## Related Projects

- [Backlog.md](https://github.com/MrLesk/Backlog.md) - The task management system
- [Model Context Protocol](https://modelcontextprotocol.io/) - MCP specification
- [Claude](https://claude.ai) - AI assistant with MCP support

## Support

- **Issues**: [GitHub Issues](https://github.com/radleta/Backlog.md-mcp/issues)
- **Backlog.md**: [Official Repository](https://github.com/MrLesk/Backlog.md)
- **MCP Documentation**: [modelcontextprotocol.io](https://modelcontextprotocol.io)