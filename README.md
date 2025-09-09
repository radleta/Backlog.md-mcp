# Backlog.md MCP Server

An MCP (Model Context Protocol) server that wraps [Backlog.md](https://github.com/MrLesk/Backlog.md) task management system, enabling AI assistants like Claude to directly manage tasks, view boards, and handle sprints.

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

### Quick Setup

Run the interactive setup:

```bash
backlog-mcp setup
```

This will automatically configure Claude Desktop to use the MCP server.

### Manual Configuration

Add to your Claude Desktop configuration file:

**Location:**
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/claude/claude_desktop_config.json`

**Configuration:**
```json
{
  "mcpServers": {
    "backlog-md": {
      "command": "backlog-mcp",
      "args": ["start"]
    }
  }
}
```

### Claude Code Integration

To use with Claude Code, install the MCP server using the Claude CLI:

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
- "Show me all tasks in progress"
- "Move task-123 to done"
- "Display the Kanban board"
- "Create a new 2-week sprint starting Monday"


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

### Building from Source

```bash
# Install development dependencies
cd source
npm install

# Run tests
npm test

# Build the project
cd ..
./build.sh
```

### Running Tests

```bash
cd source
npm test
# or with Bun
bun test
```

### Development Workflow

1. Make changes in `source/src/`
2. Run tests: `cd source && npm test`
3. Build: `./build.sh`
4. Test locally: `cd package && npm link`
5. Use: `backlog-mcp start`

## Transport Modes

The server supports two transport modes:

### STDIO (Default)
Used by Claude Desktop and other MCP clients:
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
- Verify Claude Desktop has been restarted after configuration
- Run `backlog-mcp validate` to check setup

### Commands Failing
- Ensure you have a valid Backlog.md repository initialized
- Check configuration: `backlog-mcp config get backlog_cli_path`
- Verify the Backlog.md CLI works: `backlog --help`

### Debugging
- Use verbose mode: `backlog-mcp start --verbose`
- Check Claude Desktop logs for connection errors
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
- [Claude Desktop](https://claude.ai/download) - AI assistant with MCP support

## Support

- **Issues**: [GitHub Issues](https://github.com/radleta/Backlog.md-mcp/issues)
- **Backlog.md**: [Official Repository](https://github.com/MrLesk/Backlog.md)
- **MCP Documentation**: [modelcontextprotocol.io](https://modelcontextprotocol.io)