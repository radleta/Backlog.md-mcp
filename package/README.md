# Backlog.md MCP Integration

This repository provides an MCP (Model Context Protocol) server that integrates [Backlog.md](https://github.com/MrLesk/Backlog.md) with Claude Code, enabling Claude to directly manage tasks, view boards, and handle sprints through natural language.

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

## Installation

### Prerequisites

- [Bun](https://bun.sh) runtime installed
- [Claude Code](https://claude.ai) CLI tool
- Git for cloning with submodules

### Setup Steps

1. **Clone this repository with submodules**:
   ```bash
   git clone --recursive https://github.com/[your-username]/backlog-mcp-integration.git
   cd backlog-mcp-integration
   ```

2. **Install dependencies**:
   ```bash
   # Install MCP server dependencies
   cd src
   bun install
   
   # Build the Backlog.md CLI
   cd ../Backlog.md
   bun install
   bun run build
   ```

3. **Configure Claude Code**:
   
   Use the Claude CLI to add the server:
   ```bash
   claude mcp add backlog-md -- bun run /absolute/path/to/backlog-mcp-integration/src/backlog-mcp-server.ts
   ```

   ⚠️ **Important**: Replace `/absolute/path/to/backlog-mcp-integration` with the actual absolute path to where you cloned this repository.

## Usage

Once the MCP server is connected, you can interact with your backlog through Claude using natural language:

### Example Commands

- **Creating Tasks**:
  - "Create a new high-priority task for implementing user authentication"
  - "Add a task titled 'Fix login bug' with urgent priority"

- **Viewing Tasks**:
  - "Show me all tasks that are in progress"
  - "List all blocked tasks"
  - "What high-priority tasks do I have?"

- **Managing Tasks**:
  - "Move task-123 to done"
  - "Edit task-456 to change its priority to high"
  - "Delete task-789"

- **Board & Sprint Operations**:
  - "Display the Kanban board"
  - "Create a new sprint starting Monday for 2 weeks"
  - "Show the current sprint details"

## Data Storage

**Important**: This MCP server does not store any backlog data itself. It acts as a bridge between Claude Code and the Backlog.md CLI tool.

### How Data Storage Works

- **Backlog data location**: All tasks, boards, and sprint data are stored by the underlying Backlog.md CLI according to its own configuration and working directory
- **MCP server config**: Only stores server settings in `~/.backlog-mcp/config.json` (things like custom CLI path)
- **Claude Code config**: Stores MCP server connection details in Claude Code's MCP configuration

### Finding Your Backlog Data

To determine where your backlog files are actually saved:
- Ask Claude: "What's the current backlog storage configuration?"
- Or use: "Show me the backlog config settings"
- The MCP server will query the Backlog.md CLI to get the actual data storage location

### Data Backup

Since all data is managed by the Backlog.md CLI, refer to the [Backlog.md documentation](https://github.com/MrLesk/Backlog.md) for backup and data management procedures.

## Project Structure

```
backlog-mcp-integration/
├── src/                          # MCP server implementation
│   ├── backlog-mcp-server.ts    # Main server file
│   ├── package.json             # Server dependencies
│   └── claude-config-example.json # Example configuration
├── Backlog.md/                  # Official Backlog.md submodule
│   └── ...                      # Core Backlog.md project files
└── README.md                    # This file
```

## Development

### Running the Server Standalone

For testing and development:

```bash
cd src
bun run start
```

### Updating Backlog.md

To update to the latest version of Backlog.md:

```bash
git submodule update --remote Backlog.md
cd Backlog.md
bun install
bun run build
```

## Troubleshooting

### Server Not Connecting
- Ensure you're using absolute paths in the Claude configuration
- Verify Bun is installed and accessible in your PATH
- Verify the MCP server was properly configured with Claude Code

### Commands Failing
- Ensure the Backlog.md CLI is built: `cd Backlog.md && bun run build`
- Check that you have a valid backlog structure in your working directory
- Verify the backlog configuration with: `cd Backlog.md && bun run cli config list`

### Debugging
- The MCP server logs to stderr, which won't interfere with Claude communication
- Check Claude Code logs for connection errors
- Run the server standalone to see detailed error messages

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

This MCP integration follows the same license as the parent Backlog.md project.

## Related Projects

- [Backlog.md](https://github.com/MrLesk/Backlog.md) - The official task management system
- [Model Context Protocol](https://modelcontextprotocol.io) - The protocol specification
- [Claude](https://claude.ai) - The AI assistant that uses this integration