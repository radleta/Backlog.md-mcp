# Backlog.md MCP Server

This project provides an MCP (Model Context Protocol) server that enables AI assistants to interact with the Backlog.md task management system.

## Project Overview

The Backlog.md MCP Server wraps the Backlog.md CLI tool to provide structured access to task management features through the Model Context Protocol. This allows Claude Desktop and Claude Code to directly manage tasks, view boards, and handle sprints.

## Available MCP Tools

### Task Management
- `task_create` - Create new tasks with title, description, status, priority, and tags
- `task_list` - List tasks with filtering by status, tag, or priority  
- `task_edit` - Edit existing tasks
- `task_move` - Move tasks between status columns
- `task_delete` - Delete tasks

### Board & Sprint Management
- `board_show` - Display the Kanban board
- `sprint_create` - Create new sprints with dates and goals
- `sprint_current` - Show current sprint details

### Configuration
- `config_get` - Get configuration values
- `config_set` - Set configuration values

## Available Resources

The server exposes these resources for reading:
- `backlog://tasks/all` - View all tasks in markdown format
- `backlog://board` - Current Kanban board view
- `backlog://config` - Configuration settings
- `backlog://sprint/current` - Current sprint details

## Setup Instructions

### For Claude Desktop

The project includes an interactive setup wizard:

```bash
npm install -g @radleta/backlog-md-mcp
backlog-mcp setup
```

This will automatically configure Claude Desktop's `claude_desktop_config.json` file.

### For Claude Code

Use the Claude CLI to add the MCP server:

```bash
# Install the server globally
npm install -g @radleta/backlog-md-mcp

# Add to Claude Code (user scope - available in all projects)
claude mcp add backlog-md --scope user -- backlog-mcp start

# Or add for current project only
claude mcp add backlog-md --scope project -- backlog-mcp start
```

## Development

### Building from Source

```bash
# Clone the repository
git clone --recursive https://github.com/radleta/Backlog.md-mcp.git
cd Backlog.md-mcp

# Build the project
./build.sh

# Install globally
cd package
npm install -g .
```

### Running Tests

```bash
cd source
npm test
npm run typecheck
npm run lint
```

### Project Structure

- `source/` - TypeScript source code
  - `src/server.ts` - MCP server implementation
  - `src/cli.ts` - CLI commands
  - `src/config.ts` - Configuration management
  - `src/setup.ts` - Setup wizard
- `package/` - Distribution package
  - `dist/` - Compiled JavaScript
  - `bin/` - Executable scripts
- `Backlog.md/` - Git submodule of the official Backlog.md project

## Troubleshooting

### Validation

Run the validation command to check your setup:

```bash
backlog-mcp validate
```

### Common Issues

1. **Server not connecting**: Ensure `backlog-mcp` is in your PATH and restart Claude Desktop
2. **Commands failing**: Check that Backlog.md is initialized in your project directory
3. **MCP indicator not showing**: Verify the configuration file is valid JSON

## Contributing

Contributions are welcome! Please ensure all tests pass and TypeScript compilation succeeds before submitting pull requests.

## License

MIT License - See LICENSE file for details