# Backlog.md MCP Integration

This repository provides an MCP (Model Context Protocol) server that integrates [Backlog.md](https://github.com/MrLesk/Backlog.md) with Claude Desktop, enabling Claude to directly manage tasks, view boards, and handle sprints through natural language.

## Features

### 🛠️ Available Tools

- **Task Management**
  - `task_create` - Create new tasks with title, description, status, priority, and tags
  - `task_list` - List tasks with filtering by status, tag, or priority  
  - `task_edit` - Edit existing tasks
  - `task_move` - Move tasks between status columns
  - `task_delete` - Delete tasks

- **Board & Sprint Management**
  - `board_show` - Display the Kanban board
  - `sprint_create` - Create new sprints
  - `sprint_current` - Show current sprint details

- **Configuration**
  - `config_get` - Get configuration values
  - `config_set` - Set configuration values

### 📚 Available Resources

- `backlog://tasks/all` - View all tasks in markdown format
- `backlog://board` - Current Kanban board view
- `backlog://config` - Configuration settings
- `backlog://sprint/current` - Current sprint details

## Installation

### Prerequisites

- [Bun](https://bun.sh) runtime installed
- [Claude Desktop](https://claude.ai/download) application
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

3. **Configure Claude Desktop**:
   
   Find your Claude configuration file:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux**: `~/.config/claude/claude_desktop_config.json`

   Add the Backlog.md server configuration:
   ```json
   {
     "mcpServers": {
       "backlog-md": {
         "command": "bun",
         "args": [
           "run",
           "/absolute/path/to/backlog-mcp-integration/src/backlog-mcp-server.ts"
         ]
       }
     }
   }
   ```

   ⚠️ **Important**: Replace `/absolute/path/to/backlog-mcp-integration` with the actual absolute path to where you cloned this repository.

4. **Restart Claude Desktop** to load the MCP server

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

**Important**: This MCP server does not store any backlog data itself. It acts as a bridge between Claude Desktop and the Backlog.md CLI tool.

### How Data Storage Works

- **Backlog data location**: All tasks, boards, and sprint data are stored by the underlying Backlog.md CLI according to its own configuration and working directory
- **MCP server config**: Only stores server settings in `~/.backlog-mcp/config.json` (things like custom CLI path)
- **Claude Desktop config**: Stores MCP server connection details in platform-specific Claude configuration file

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
- Check that Claude Desktop has been restarted after configuration changes

### Commands Failing
- Ensure the Backlog.md CLI is built: `cd Backlog.md && bun run build`
- Check that you have a valid backlog structure in your working directory
- Verify the backlog configuration with: `cd Backlog.md && bun run cli config list`

### Debugging
- The MCP server logs to stderr, which won't interfere with Claude communication
- Check Claude Desktop logs for connection errors
- Run the server standalone to see detailed error messages

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

This MCP integration follows the same license as the parent Backlog.md project.

## Related Projects

- [Backlog.md](https://github.com/MrLesk/Backlog.md) - The official task management system
- [Model Context Protocol](https://modelcontextprotocol.io) - The protocol specification
- [Claude Desktop](https://claude.ai) - The AI assistant that uses this integration