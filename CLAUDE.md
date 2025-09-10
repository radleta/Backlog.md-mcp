# Backlog.md MCP Server

This project provides an MCP (Model Context Protocol) server that enables AI assistants to interact with the Backlog.md task management system.

## Project Overview

The Backlog.md MCP Server wraps the Backlog.md CLI tool to provide structured access to task management features through the Model Context Protocol. This allows Claude Code to directly manage tasks, view boards, and handle sprints.

## Available MCP Tools

### Task Management
- `task_create` - Create new tasks with full support for title, description, status, priority, tags, assignee, plan, notes, acceptance criteria, dependencies, parent tasks, and draft mode
- `task_list` - List tasks with enhanced filtering by status, tag, priority, assignee, parent task ID, and sorting options (priority, id)
- `task_edit` - Edit existing tasks with comprehensive support for all task properties, acceptance criteria management (add/remove/check/uncheck), label management, and custom ordering
- `task_view` - View detailed task information
- `task_archive` - Archive tasks
- `task_demote` - Demote tasks to draft status
- `task_dependencies` - View dependency graph for a specific task
- `task_children` - List all children of a parent task

### Draft Management
- `draft_create` - Create draft tasks with title, description, assignee, and labels
- `draft_list` - List all draft tasks
- `draft_promote` - Promote draft tasks to full tasks
- `draft_archive` - Archive draft tasks
- `draft_view` - View draft task details

### Documentation
- `doc_create` - Create documentation files with optional path and type
- `doc_list` - List all documentation files
- `doc_view` - View specific documentation files

### Decision Records
- `decision_create` - Create decision records with status (proposed/accepted/rejected/superseded)
- `decision_list` - List all decision records with titles and status

### Board & Project Management
- `board_show` - Display the Kanban board
- `board_export` - Export Kanban board to markdown with options for custom filename, force overwrite, README integration, and version tagging
- `overview` - Show project statistics and overview
- `cleanup` - Move old completed tasks to archive folder
- `sequence_list` - List execution sequences computed from task dependencies

### Configuration
- `config_get` - Get specific configuration values
- `config_set` - Set configuration values
- `config_list` - List all configuration values

### Web Interface & Utilities
- `browser` - Launch web interface with optional port and browser settings
- `agents_update` - Update agent instruction files (.cursorrules, CLAUDE.md, AGENTS.md, etc.)

## Effective Task Management

When creating tasks, always consider:
1. **Acceptance Criteria** - Define measurable completion conditions
2. **Dependencies** - Set execution order between related tasks  
3. **Sub-tasks** - Break complex work into manageable pieces
4. **Priority** - Indicate task importance (high/medium/low)

Example workflow:
- Create parent task for major feature
- Add sub-tasks for implementation steps
- Set dependencies between sub-tasks
- Include acceptance criteria for each task
- Use sequence_list to verify execution order

## Available Resources

The server exposes these resources for reading:
- `backlog://tasks/all` - View all tasks in markdown format
- `backlog://board` - Current Kanban board view
- `backlog://config` - Configuration settings
- `backlog://drafts/all` - View all draft tasks in markdown format
- `backlog://docs/all` - View all documentation files
- `backlog://overview` - Project statistics and overview
- `backlog://sequences` - Execution sequences computed from task dependencies
- `backlog://decisions/all` - View all decision records
- `backlog://tasks/by-priority` - Tasks grouped by priority
- `backlog://statistics` - Enhanced project statistics and metrics

## Setup Instructions

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

This project uses a dual-environment approach that allows you to develop the MCP server while maintaining a stable version for daily use.

### Development Workflow for Contributors

**🧪 Quick Development Mode**
```bash
# Clone the repository
git clone --recursive https://github.com/radleta/Backlog.md-mcp.git
cd Backlog.md-mcp

# Build and test
./build.sh
./dev.sh validate

# Make changes in source/src/
# Test changes
./dev.sh start
```

**🔄 Development vs Production**

| Environment | Command | Config Directory | Purpose |
|-------------|---------|-----------------|---------|
| **Development** | `./dev.sh` | `~/.config/backlog-mcp-dev` | Testing changes |
| **Production** | `backlog-mcp` | `~/.config/backlog-mcp` | Stable daily use |

**⚡ Convenience Scripts**

- `./dev.sh` - Access development version easily
- `./test-mcp.sh` - Run full test suite and validation

### Building from Source

```bash
# Clone and build
git clone --recursive https://github.com/radleta/Backlog.md-mcp.git
cd Backlog.md-mcp
./build.sh
```

### Running Tests

```bash
cd source
npm test
npm run typecheck
npm run lint

# Or run full integration test
./test-mcp.sh
```

### Development with Claude Code

```bash
# Add development version to Claude Code
claude mcp add backlog-md-dev -- node /absolute/path/to/Backlog.md-mcp/package/bin/backlog-mcp-dev start

# Switch between versions
claude mcp remove backlog-md-dev  # Remove dev
claude mcp add backlog-md -- backlog-mcp start  # Use production

# Or keep both configured with different names
```

### Installing for Production Use

When you have a stable version you want to use daily:

```bash
cd package
npm install -g .

# Now use normally
backlog-mcp validate
claude mcp add backlog-md -- backlog-mcp start
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

1. **Server not connecting**: Ensure `backlog-mcp` is in your PATH
2. **Commands failing**: Check that Backlog.md is initialized in your project directory

## Contributing

Contributions are welcome! Please ensure all tests pass and TypeScript compilation succeeds before submitting pull requests.

## License

MIT License - See LICENSE file for details