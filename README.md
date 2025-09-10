# Backlog.md MCP Server

An MCP (Model Context Protocol) server that wraps [Backlog.md](https://github.com/MrLesk/Backlog.md) task management system, enabling AI assistants like Claude to directly manage tasks and view Kanban boards.

## Features

### 🛠️ Available Tools

- **Task Management**
  - `task_create` - Create new tasks with full support for title, description, status, priority, tags, assignee, plan, notes, acceptance criteria, dependencies, parent tasks, and draft mode
  - `task_list` - List tasks with enhanced filtering by status, tag, priority, assignee, parent task ID, and sorting options (priority, id)
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

- **Status values**: Must match your Backlog.md configuration exactly (default: "To Do", "In Progress", "Done")
- **Non-interactive mode**: The MCP server automatically uses `--plain` flags to prevent interactive prompts
- **Tags**: Use the `tags` parameter in MCP commands, which maps to `--labels` in the CLI

### Limitations

- **Initialization**: The `backlog init` command cannot be implemented through MCP as it requires interactive user input. Projects must be initialized manually before using the MCP server.
- **Interactive Commands**: Any Backlog.md commands that require user interaction are not available through the MCP interface.

### Known Issues

- **Multi-instance Race Conditions**: Multiple Claude instances using the same MCP server on the same project may cause file conflicts and data corruption. See [task-001](backlog/tasks/task-001%20-%20File-operation-race-conditions-with-multiple-MCP-instances.md) for details and planned fixes.

### Tool Parameter Details

- **task_create**: 
  - `title` (required): Task title as a string
  - `description` (optional): Task description
  - `status` (optional): Must be exact: "To Do", "In Progress", or "Done"
  - `priority` (optional): "low", "medium", or "high"
  - `tags` (optional): Array of strings (mapped to `--labels` in CLI)

- **task_list**:
  - `status` (optional): Filter by status or "all" for all tasks
  - `tag` (optional): Filter by a specific tag
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
npm install -g backlog-md-mcp
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
npm install -g backlog-md-mcp

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


## Project Structure

```
Backlog.md-mcp/
├── source/                 # Development source code
│   ├── src/               # TypeScript source files
│   │   ├── server.ts      # MCP server implementation
│   │   ├── cli.ts         # CLI implementation
│   │   ├── config.ts      # Configuration management
│   │   └── setup.ts       # Interactive setup
│   ├── test/              # Test files
│   ├── package.json       # Development dependencies
│   └── tsconfig.json      # TypeScript configuration
├── package/               # Distribution package
│   ├── dist/              # Compiled JavaScript
│   ├── bin/               # Executable scripts
│   ├── package.json       # Runtime dependencies
│   └── README.md          # Package documentation
├── Backlog.md/            # Git submodule (official Backlog.md)
└── build.sh               # Build script
```

## Development

### Prerequisites

- Node.js 18+ or Bun runtime
- TypeScript 5+
- Git

### Development Setup

The project uses a dual-environment approach to allow development while maintaining a stable production version.

#### Building from Source

```bash
# Clone and build
git clone --recursive https://github.com/radleta/Backlog.md-mcp.git
cd Backlog.md-mcp
./build.sh
```

#### Development Workflow

**🧪 Development Mode (Recommended)**
```bash
# Make changes in source/src/
# Build and test with convenience script
./dev.sh validate
./dev.sh start

# Or run full test suite
./test-mcp.sh
```

**📦 Direct Path Execution**
```bash
# Build the project
./build.sh

# Run development version directly
node package/bin/backlog-mcp-dev validate
node package/bin/backlog-mcp-dev start
```

**🚀 Production Installation**
```bash
# Install stable version for daily use
cd package
npm install -g .

# Use normally
backlog-mcp start
claude mcp add backlog-md -- backlog-mcp start
```

### Development vs Production

| Aspect | Development | Production |
|--------|------------|------------|
| **Command** | `./dev.sh` or `node package/bin/backlog-mcp-dev` | `backlog-mcp` |
| **Config Dir** | `~/.config/backlog-mcp-dev` | `~/.config/backlog-mcp` |
| **Environment** | `BACKLOG_ENV=development` | `BACKLOG_ENV=production` |
| **Installation** | Direct execution | Global npm package |
| **Claude Code** | `node /path/to/package/bin/backlog-mcp-dev start` | `backlog-mcp start` |

### Running Tests

```bash
cd source
npm test
# or with Bun
bun test

# Full integration test
./test-mcp.sh
```

### Claude Code Integration for Development

```bash
# Add development version
claude mcp add backlog-md-dev -- node /home/ubuntu/Backlog.md-mcp/package/bin/backlog-mcp-dev start

# Switch back to production (if installed)
claude mcp remove backlog-md-dev
claude mcp add backlog-md -- backlog-mcp start
```

## Transport Modes

The server supports two transport modes:

### STDIO (Default)
Used by MCP clients:
```bash
backlog-mcp start --transport stdio
```

### HTTP
For development and testing:
```bash
backlog-mcp start --transport http --port 3000
```

## Troubleshooting

### Server Not Connecting
- Ensure `backlog-mcp` is in your PATH
- Run `backlog-mcp validate` to check setup

### Commands Failing
- Ensure you have a valid Backlog.md repository initialized (`backlog init`)
- Check that you're in the correct project directory
- Verify the Backlog.md CLI works: `backlog --help`
- Ensure status values match exactly (case-sensitive): "To Do", "In Progress", "Done"

### Commands Hanging or No Response
- This typically means the CLI is waiting for interactive input
- The MCP server should automatically use `--plain` flags to prevent this
- Check that you're using the latest version of the MCP server

### Debugging
- Use verbose mode: `backlog-mcp start --verbose`
- Run `backlog-mcp info` to see server capabilities

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Ensure all tests pass
5. Submit a pull request

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