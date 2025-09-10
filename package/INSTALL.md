# Installation Guide for Backlog.md MCP Server

## Quick Start

Install the Backlog.md MCP server globally using npm:

```bash
npm install -g @radleta/backlog-md-mcp
```

Then run the setup wizard:

```bash
backlog-mcp setup
```

Restart Claude Desktop and you're ready to go!

## Prerequisites

- **Node.js** (v18 or higher) or **Bun** runtime
- **Claude Desktop** application installed
- **npm** or **yarn** or **pnpm** package manager

## Detailed Installation Steps

### 1. Install the Package

#### Using npm (recommended):
```bash
npm install -g @radleta/backlog-md-mcp
```

#### Using yarn:
```bash
yarn global add @radleta/backlog-md-mcp
```

#### Using pnpm:
```bash
pnpm add -g @radleta/backlog-md-mcp
```

### 2. Run the Setup Wizard

After installation, run the interactive setup wizard:

```bash
backlog-mcp setup
```

The wizard will:
- Detect your Claude Desktop installation
- Configure the MCP server integration
- Set up the transport method (STDIO or HTTP)
- Create necessary configuration files

### 3. Verify the Installation

Check that everything is configured correctly:

```bash
backlog-mcp validate
```

This command will verify:
- ✅ Claude Desktop configuration exists
- ✅ Backlog.md MCP server is configured
- ✅ Backlog.md CLI is accessible
- ✅ All dependencies are installed

### 4. Restart Claude Desktop

Close and reopen Claude Desktop to load the new MCP server configuration.

## Manual Configuration

If you prefer to configure manually or the setup wizard doesn't work for your system:

### Find Your Claude Desktop Config File

The configuration file location depends on your operating system:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/claude/claude_desktop_config.json`

### Edit the Configuration

Add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "backlog-md": {
      "command": "backlog-mcp",
      "args": ["start", "--transport", "stdio"]
    }
  }
}
```

## Usage Examples

Once installed and configured, you can use natural language commands in Claude Desktop:

### Task Management
- "Create a new task for implementing user authentication"
- "Show me all high-priority tasks"
- "Move task-123 to done"
- "Edit task-456 to change its description"

### Board Views
- "Display the Kanban board"
- "Show me what's in progress"
- "What tasks are blocked?"

### Sprint Management
- "Create a new 2-week sprint starting Monday"
- "Show the current sprint details"
- "Add task-789 to the current sprint"

## Troubleshooting

### Command not found: backlog-mcp

If the command is not found after installation:

1. Check your npm global installation path:
   ```bash
   npm config get prefix
   ```

2. Ensure the bin directory is in your PATH:
   - **macOS/Linux**: Add to `~/.bashrc` or `~/.zshrc`:
     ```bash
     export PATH="$(npm config get prefix)/bin:$PATH"
     ```
   - **Windows**: Add `%APPDATA%\npm` to your system PATH

3. Reload your shell configuration or restart your terminal

### Claude Desktop Not Detected

If the setup wizard can't find Claude Desktop:

1. Ensure Claude Desktop is installed from: https://claude.ai/download
2. Try specifying the config path manually:
   ```bash
   backlog-mcp setup --path /path/to/claude_desktop_config.json
   ```

### Server Connection Issues

If Claude can't connect to the MCP server:

1. Validate the setup:
   ```bash
   backlog-mcp validate
   ```

2. Test the server manually:
   ```bash
   backlog-mcp start
   ```

3. Check the Claude Desktop logs for error messages

### Backlog.md CLI Not Found

The MCP server includes Backlog.md as a dependency, but if you encounter issues:

1. Install Backlog.md globally:
   ```bash
   npm install -g backlog.md
   ```

2. Set a custom path in the configuration:
   ```bash
   backlog-mcp config set backlogCliPath /path/to/backlog
   ```

## Configuration Options

### View Current Configuration
```bash
backlog-mcp config show
```

### Set Configuration Values
```bash
backlog-mcp config set <key> <value>
```

Available configuration keys:
- `backlogCliPath` - Path to Backlog.md CLI
- `transport` - Transport type (stdio or http)
- `port` - HTTP server port
- `autoStart` - Auto-start with Claude Desktop

## Updating

To update to the latest version:

```bash
npm update -g @radleta/backlog-md-mcp
```

After updating, run the setup wizard again to ensure compatibility:

```bash
backlog-mcp setup
```

## Uninstalling

To remove the MCP server:

1. Remove from Claude Desktop config:
   ```bash
   backlog-mcp config set mcpEnabled false
   ```

2. Uninstall the package:
   ```bash
   npm uninstall -g @radleta/backlog-md-mcp
   ```

## Getting Help

- **Documentation**: https://github.com/radleta/backlog-md-mcp
- **Issues**: https://github.com/radleta/backlog-md-mcp/issues
- **Backlog.md**: https://github.com/MrLesk/Backlog.md

Run `backlog-mcp --help` for a list of all available commands.