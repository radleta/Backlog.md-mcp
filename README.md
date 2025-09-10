# Backlog.md MCP Server

[![npm version](https://img.shields.io/npm/v/@radleta/backlog-md-mcp.svg)](https://www.npmjs.com/package/@radleta/backlog-md-mcp)
[![npm downloads](https://img.shields.io/npm/dm/@radleta/backlog-md-mcp.svg)](https://www.npmjs.com/package/@radleta/backlog-md-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An MCP (Model Context Protocol) server that wraps [Backlog.md](https://github.com/MrLesk/Backlog.md) task management system, enabling AI assistants like Claude to directly manage tasks and view Kanban boards.

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

The Backlog.md MCP Server is designed as a complete wrapper around the Backlog.md CLI, following these principles:

- **Complete CLI Coverage**: Exposes all available Backlog.md CLI commands through the MCP interface
- **Read-Only Enhancements**: Provides additional read-only helpers (like task aggregation and grouping) that don't modify data
- **Write Operation Integrity**: All data modifications go exclusively through the official CLI commands to maintain data consistency
- **No Custom Write Logic**: We deliberately don't implement custom edit capabilities to avoid breaking Backlog.md's internal write implementation
- **Non-Interactive Operations**: Commands that require user interaction (like `backlog init`) cannot be implemented through MCP

This approach ensures the MCP server remains a reliable, maintainable wrapper that respects Backlog.md's architecture while providing useful programmatic access for AI assistants.

## Security

The Backlog.md MCP Server implements comprehensive security measures to protect against common vulnerabilities:

- **Command Injection Prevention**: All user inputs are validated and shell arguments are properly escaped
- **Path Traversal Protection**: File system operations are restricted to project directories
- **Configuration Security**: Protected against prototype pollution attacks
- **Pass-through Philosophy**: Security measures escape dangerous characters rather than removing them, preserving user intent

All security implementations are thoroughly tested with 16 dedicated security tests covering various attack vectors.

## MCP Server Enhancements

This MCP server provides additional functionality beyond the native Backlog.md CLI:

### Enhanced Features (MCP-only)
- **Label filtering in task_list**: Filter tasks by label (implemented client-side as the CLI doesn't support this natively)
- **Resource aggregation**: View tasks grouped by priority (`backlog://tasks/by-priority`)
- **Enhanced statistics**: Additional metrics beyond native overview (`backlog://statistics`)
- **Decision list tool**: Custom `decision_list` with status parsing (CLI only has `decision create`)
- **Decision resources**: Parsed decision records with status display (`backlog://decisions/all`)
- **Task dependency extraction**: Parses dependencies from task view output

### Native CLI Pass-through
All other features directly use the Backlog.md CLI commands:
- Task creation, editing, viewing, archiving
- Board operations and export
- Configuration management
- Draft task operations
- Documentation management
- Core sequence and dependency features

## MCP Enhancement Matrix

This table shows how each feature is implemented to help you understand performance and behavior:

| Feature | Type | Implementation | Performance Notes |
|---------|------|----------------|-------------------|
| **label filtering (task_list)** | MCP Enhancement | Client-side: fetches all tasks, then individual task details | O(n) calls - expensive for large task lists |
| **decision_list** | MCP Enhancement | Custom filesystem parsing with status extraction | Efficient - single directory read |
| **backlog://tasks/by-priority** | MCP Enhancement | Multiple CLI calls with "No Priority" section | Multiple CLI calls, in-memory grouping |
| **backlog://statistics** | MCP Enhancement | Combines CLI overview + custom analytics | Two CLI calls + processing |
| **backlog://decisions/all** | MCP Enhancement | Direct filesystem parsing with status extraction | Efficient - single directory read |
| **task_dependencies** | CLI + Processing | Parses dependencies from `task view` output | Single CLI call + regex parsing |
| **task_create/edit/view/archive** | Pure CLI Pass-through | Direct CLI command mapping | Native CLI performance |
| **board_show/export** | Pure CLI Pass-through | Direct CLI command mapping | Native CLI performance |
| **config_get/set/list** | Pure CLI Pass-through | Direct CLI command mapping | Native CLI performance |
| **draft operations** | Pure CLI Pass-through | Direct CLI command mapping | Native CLI performance |
| **doc operations** | Pure CLI Pass-through | Direct CLI command mapping | Native CLI performance |
| **decision_create** | Pure CLI Pass-through | Direct CLI command mapping | Native CLI performance |
| **sequence_list** | Pure CLI Pass-through | Direct CLI command mapping | Native CLI performance |
| **agents_update, cleanup, browser** | Pure CLI Pass-through | Direct CLI command mapping | Native CLI performance |


### 📚 Available Resources

- `backlog://tasks/all` - View all tasks in markdown format
- `backlog://board` - Current Kanban board view
- `backlog://config` - Configuration settings
- `backlog://drafts/all` - View all draft tasks in markdown format
- `backlog://docs/all` - View all documentation files
- `backlog://overview` - Project statistics and overview
- `backlog://sequences` - Execution sequences computed from task dependencies
- `backlog://decisions/all` - View all decision records
- `backlog://tasks/by-priority` - Tasks grouped by priority levels
- `backlog://statistics` - Enhanced project statistics and metrics

## Prerequisites

Before using the MCP server, ensure:

1. **Backlog.md is installed**: The MCP server requires the [Backlog.md CLI](https://github.com/MrLesk/Backlog.md) to be available
2. **Project initialization**: Your project must have Backlog.md initialized (`backlog init`)
3. **Working directory**: The MCP server runs commands in the directory where Claude is working

### Important Notes

- **Status values**: Must match your Backlog.md configuration exactly (check with `backlog config get statuses`)
- **Non-interactive mode**: The MCP server automatically uses `--plain` flags to prevent interactive prompts
- **Labels**: Use the `labels` parameter in MCP commands, which maps to `--labels` in the CLI

### Limitations

- **Initialization**: The `backlog init` command cannot be implemented through MCP as it requires interactive user input. Projects must be initialized manually before using the MCP server.
- **Interactive Commands**: Any Backlog.md commands that require user interaction are not available through the MCP interface.

### Known Issues

- **Multi-instance Race Conditions**: Multiple Claude instances using the same MCP server on the same project may cause file conflicts and data corruption. See [task-001](backlog/tasks/task-001%20-%20File-operation-race-conditions-with-multiple-MCP-instances.md) for details and planned fixes.

### Tool Parameter Details

- **task_create**: 
  - `title` (required): Task title as a string
  - `description` (optional): Task description
  - `status` (optional): Must match your Backlog.md configuration exactly (check with `backlog config get statuses`)
  - `priority` (optional): "low", "medium", or "high"
  - `labels` (optional): Array of strings (mapped to `--labels` in CLI)

- **task_list**:
  - `status` (optional): Filter by status or "all" for all tasks
  - `label` (optional): Filter by a specific label
  - `priority` (optional): Filter by priority level

- **task_edit**:
  - `taskId` (required): Task identifier (e.g., "task-123")
  - `title`, `description`, `status`, `priority` (all optional): New values

- **task_view**:
  - `taskId` (required): Task identifier to view

- **task_archive**:
  - `taskId` (required): Task identifier to archive

## Installation

### From npm

```bash
npm install -g @radleta/backlog-md-mcp
```

### From Source

1. **Clone the repository with submodules**:
   ```bash
   git clone --recursive https://github.com/radleta/Backlog.md-mcp.git
   cd Backlog.md-mcp
   ```

2. **Build the project**:
   ```bash
   ./build.sh
   ```

3. **Install globally**:
   ```bash
   cd package
   npm install -g .
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

### Setup

For Claude Code users:

```bash
# Install the server globally
npm install -g @radleta/backlog-md-mcp

# Add to Claude Code
claude mcp add backlog-md -- backlog-mcp start
```

```bash
# Install the server globally first
npm install -g @radleta/backlog-md-mcp

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



## Building from Source

If you want to build and install from source:

```bash
# Clone and build
git clone --recursive https://github.com/radleta/Backlog.md-mcp.git
cd Backlog.md-mcp
./build.sh

# Install globally
cd package
npm install -g .
```

## Troubleshooting

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

## Contributing

Contributions are welcome! For detailed development setup, testing procedures, and contribution guidelines, see [DEVELOPMENT.md](DEVELOPMENT.md).

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