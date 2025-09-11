# Backlog.md MCP Server

An MCP (Model Context Protocol) server that wraps [Backlog.md](https://github.com/MrLesk/Backlog.md) task management system, enabling AI assistants like Claude to directly manage tasks and view Kanban boards.

> **📦 For Users**: Install from npm: `npm install -g @radleta/backlog-md-mcp`  
> See [npm package](https://www.npmjs.com/package/@radleta/backlog-md-mcp) for usage instructions.

This guide provides detailed instructions for contributing to and developing the Backlog.md MCP Server.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Code Style & Conventions](#code-style--conventions)
- [Environment Management](#environment-management)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Architecture Overview

The Backlog.md MCP Server is designed as a complete wrapper around the [Backlog.md CLI](https://github.com/MrLesk/Backlog.md), following these principles:

### Design Philosophy

- **Complete CLI Coverage**: Exposes all available Backlog.md CLI commands through MCP
- **Read-Only Enhancements**: Provides additional helpers that don't modify data
- **Write Operation Integrity**: All modifications go through official CLI commands
- **No Custom Write Logic**: Avoids breaking Backlog.md's internal implementation
- **Non-Interactive Operations**: Commands requiring user input cannot be implemented

### Project Structure

```
Backlog.md-mcp/
├── src/                    # TypeScript source files
│   ├── server.ts          # MCP server implementation
│   ├── cli.ts             # CLI implementation
│   ├── config.ts          # Configuration management
│   └── setup.ts           # Interactive setup wizard
├── test/                   # Test files
├── dist/                   # Compiled JavaScript
├── bin/                    # Executable scripts
│   ├── backlog-mcp.js     # Production wrapper
│   └── backlog-mcp-dev.js # Development wrapper
├── scripts/                # Build utilities
├── npm/                    # NPM package-specific files
│   └── README.md          # User documentation
├── Backlog.md/            # Git submodule (official Backlog.md)
├── package.json           # Unified configuration
├── tsconfig.json          # TypeScript configuration
├── README.md              # Developer documentation
├── CLAUDE.md              # Claude-specific instructions
├── build.sh               # Build script
├── dev.sh                 # Development convenience script
└── test-mcp.sh            # Integration test script
```

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

## Development Setup

### Prerequisites

- **Node.js 18+** or **Bun runtime**
- **TypeScript 5+**
- **Git**
- **Initialized Backlog.md project** in your working directory

### Installation

```bash
# Clone with submodules
git clone --recursive https://github.com/radleta/Backlog.md-mcp.git
cd Backlog.md-mcp

# Initial build
./build.sh
```

## Development Workflow

The project uses a **dual-environment approach** to separate development from production usage.

### Quick Start

```bash
# Make changes in src/
# Test your changes
./dev.sh validate

# Run full test suite
./test-mcp.sh
```

### Environment Separation

| Aspect | Development | Production |
|--------|-------------|------------|
| **Command** | `./dev.sh` or `node bin/backlog-mcp-dev.js` | `backlog-mcp` |
| **Config Directory** | `~/.config/backlog-mcp-dev` | `~/.config/backlog-mcp` |
| **Environment Variable** | `BACKLOG_ENV=development` | `BACKLOG_ENV=production` |
| **Installation Method** | Direct execution | Global npm package |

### Development Commands

#### Build and Test
```bash
./build.sh                          # Build TypeScript to JavaScript
./dev.sh validate                   # Test development version
./dev.sh start                      # Start development server
./test-mcp.sh                       # Full integration test
```

#### Direct Path Execution
```bash
node bin/backlog-mcp-dev.js validate
node bin/backlog-mcp-dev.js start
```

#### Production Installation (for stable use)
```bash
npm install -g .
backlog-mcp validate
```

### Development vs Production Environment

| Aspect | Development | Production |
|--------|------------|------------|
| **Command** | `./dev.sh` or `node bin/backlog-mcp-dev.js` | `backlog-mcp` |
| **Config Dir** | `~/.config/backlog-mcp-dev` | `~/.config/backlog-mcp` |
| **Environment** | `BACKLOG_ENV=development` | `BACKLOG_ENV=production` |
| **Installation** | Direct execution | Global npm package |
| **Claude Code** | `node /path/to/bin/backlog-mcp-dev.js start` | `backlog-mcp start` |

## Testing

### Unit Tests
```bash
npm test                            # Run unit tests
npm run test:watch                  # Watch mode
npm run test:coverage               # Coverage report
```

### Integration Testing
```bash
./test-mcp.sh                       # Full integration test
```

### Linting and Type Checking
```bash
npm run lint                        # ESLint
npm run lint:fix                    # Auto-fix issues
npm run typecheck                   # TypeScript check
```

### Security Testing

Run security-specific tests:
```bash
npm test test/security.test.ts
```

Security tests cover:
- Command injection prevention
- Path traversal protection
- Input validation
- Configuration security
- Rate limiting (for future use)
- Permission checks
- Secrets protection
npm run format                      # Prettier formatting
```

### Manual Testing with Claude Code

#### Add Development Version
```bash
# Replace /absolute/path/to with your actual path
claude mcp add backlog-md-dev -- node /absolute/path/to/Backlog.md-mcp/bin/backlog-mcp-dev.js start
```

#### Switch Between Versions
```bash
# Use development version
claude mcp remove backlog-md
claude mcp add backlog-md-dev -- node /path/to/bin/backlog-mcp-dev.js start

# Switch back to production
claude mcp remove backlog-md-dev
claude mcp add backlog-md -- backlog-mcp start
```

## Code Style & Conventions

### TypeScript Configuration
- **Target**: ES2020
- **Module**: ESNext
- **Strict mode enabled**
- **Path mapping** for clean imports

### ESLint Rules
- **@typescript-eslint/recommended**
- **Security plugin** enabled
- **Prettier integration**

### Code Conventions
- Use **async/await** over Promises
- **Error handling** with try/catch blocks
- **Type safety** - avoid `any` types
- **JSDoc comments** for public APIs
- **Consistent naming**: camelCase for variables, PascalCase for types

### Security Considerations

When developing new features:
1. **Validate all user inputs** using functions from `src/security.ts`
2. **Escape shell arguments** using `escapeShellArg()` for any command execution
3. **Validate file paths** using `sanitizePath()` and `isPathAllowed()` for filesystem operations
4. **Check configuration keys** using `isValidConfigKey()` to prevent prototype pollution
5. **Follow pass-through philosophy** - escape dangerous characters, don't remove them
6. **Add security tests** for any new user-facing functionality

Security functions available:
- `escapeShellArg(arg)` - Escapes shell metacharacters
- `validateArguments(args)` - Validates command arguments
- `sanitizePath(path)` - Prevents directory traversal
- `isPathAllowed(path, dirs)` - Restricts file access
- `isValidConfigKey(key)` - Prevents prototype pollution

### File Organization
```typescript
// Import order
import * as node from 'node:modules';
import * as external from 'external-packages';
import * as internal from './internal-modules';

// Export organization
export { specificExports };
export type { TypeExports };
export default defaultExport;
```

## Environment Management

### Development Environment Variables

The development wrapper automatically sets:
```bash
BACKLOG_ENV=development
BACKLOG_CONFIG_DIR=~/.config/backlog-mcp-dev
BACKLOG_DEV_MODE=true
```

### Configuration Directories

- **Development**: `~/.config/backlog-mcp-dev/`
- **Production**: `~/.config/backlog-mcp/` (or `~/.backlog-mcp/`)

### Environment Detection

```typescript
// In source code
const isDevelopment = process.env.BACKLOG_ENV === 'development';
const configDir = process.env.BACKLOG_CONFIG_DIR || getDefaultConfigDir();
```

## Troubleshooting

### Common Development Issues

#### Build Failures
```bash
# Clean build
rm -rf dist/
./build.sh
```

#### Test Failures
```bash
# Check TypeScript compilation
npm run typecheck

# Run specific test
npm test -- --grep "specific test"
```

#### Environment Issues
```bash
# Verify development environment
./dev.sh validate

# Check environment variables
node -e "console.log('BACKLOG_ENV:', process.env.BACKLOG_ENV)"
```

#### MCP Server Issues
```bash
# Test server startup
./dev.sh start

# Check server logs (if available)
tail -f ~/.config/backlog-mcp-dev/logs/server.log
```

### Debugging Tips

1. **Enable verbose logging**:
   ```bash
   DEBUG=* ./dev.sh start
   ```

3. **Test MCP tools individually**:
   ```bash
   # Use MCP inspector or similar tools
   ```

### Known Issues

- **Multi-instance Race Conditions**: Multiple Claude instances using the same MCP server on the same project may cause file conflicts and data corruption. See [task-001](backlog/tasks/task-001%20-%20File-operation-race-conditions-with-multiple-MCP-instances.md) for details and planned fixes.

## Contributing

### CI/CD and GitHub Actions

For details on our continuous integration and deployment setup:
- See [GitHub Actions Documentation](.github/workflows/README.md)
- Required secrets for maintainers and forks
- Workflow triggers, test matrix, and troubleshooting
- Release automation and publishing process

### Development Process

1. **Fork and clone** the repository
2. **Create a feature branch**: `git checkout -b feature/your-feature`
3. **Make changes** in `src/`
4. **Test your changes**: `./test-mcp.sh`
5. **Commit changes**: Follow conventional commit format
6. **Push and create PR**

### Commit Message Format
```
type(scope): description

- feat: new feature
- fix: bug fix
- docs: documentation changes
- refactor: code refactoring
- test: test additions/changes
- chore: maintenance tasks
```

### Pull Request Guidelines

- **Clear description** of changes
- **Tests pass** (`./test-mcp.sh`)
- **No linting errors** (`npm run lint`)
- **TypeScript compiles** (`npm run typecheck`)
- **Updated documentation** if needed

### Release Process

The release process is now fully automated using npm lifecycle scripts:

#### 1. Pre-Release Validation
```bash
npm run release  # Check package size, files, and readiness
```

#### 2. Version Bump and Release
```bash
npm version [patch|minor|major]  # Automatically:
                                  # - Updates package version
                                  # - Updates CHANGELOG.md 
                                  # - Commits changes
                                  # - Creates git tag
                                  # - Pushes to remote

npm publish  # Automatically runs tests and validation before publishing
```

#### 3. What Happens Automatically

**During `npm version`:**
- Runs `version` script: Updates CHANGELOG.md by moving "Unreleased" content to new version section
- Commits version bump and changelog changes
- Creates git tag (e.g., `v0.1.1`)
- Runs `postversion` script: Pushes commits and tags to remote repository

**During `npm publish`:**
- Runs `prepublishOnly` script: Full validation (build, test, lint, typecheck)
- Only publishes if all checks pass

#### 4. Manual Steps (Legacy Reference)
If you need to bypass automation:
1. Manually update version in `package.json`
2. Manually update `CHANGELOG.md`
3. Create git tag: `git tag v1.x.x && git push --tags`
4. Build and publish: `npm publish`

## Implementation Guidelines

### Adding New Features

**When to Add MCP Enhancement vs CLI Pass-through:**

**Add MCP Enhancement when:**
- CLI doesn't support the feature natively
- Need to combine multiple CLI operations
- Want to provide convenience/aggregation features
- Need custom output formatting

**Use CLI Pass-through when:**
- CLI already supports the operation
- No additional processing needed
- Want to maintain data integrity for write operations

**Performance Considerations:**
- Label filtering makes N+1 CLI calls (expensive for large task lists)
- Decision operations use direct filesystem access (efficient)
- Priority grouping makes multiple CLI calls but caches results
- Avoid artificial input validation that restricts CLI capabilities

For the complete enhancement matrix showing which features are implemented how, see the README.md file.

## Architecture Details

### MCP Server Implementation

The server (`src/server.ts`) implements:
- **Tool handlers** for Backlog.md CLI commands
- **Resource providers** for read-only data access
- **Error handling** and validation
- **Transport layer** (STDIO)

#### Enhancement Functions
- `groupTasksByPriority()` - Priority aggregation with "No Priority" section
- `listDecisionFiles()` - Decision filesystem parsing with status extraction
- Label filtering logic in `task_list` case (client-side implementation)

### CLI Wrapper

The CLI (`src/cli.ts`) provides:
- **Command parsing** with Commander.js
- **Configuration management**
- **Validation and setup** tools
- **Development mode** detection

### Configuration System

The config module (`src/config.ts`) handles:
- **Environment-specific** config directories
- **JSON configuration** persistence
- **Path resolution** for Backlog.md CLI
- **Project detection**

## Resources

- [Backlog.md Documentation](https://github.com/MrLesk/Backlog.md)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Node.js Documentation](https://nodejs.org/docs/)

---

For questions or support, please open an issue on the [GitHub repository](https://github.com/radleta/Backlog.md-mcp/issues).