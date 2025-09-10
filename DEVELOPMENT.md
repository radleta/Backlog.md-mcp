# Development Guide - Backlog.md MCP Server

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
├── source/                 # Development source code
│   ├── src/               # TypeScript source files
│   │   ├── server.ts      # MCP server implementation
│   │   ├── cli.ts         # CLI implementation
│   │   ├── config.ts      # Configuration management
│   │   └── setup.ts       # Interactive setup wizard
│   ├── test/              # Test files
│   ├── package.json       # Development dependencies
│   └── tsconfig.json      # TypeScript configuration
├── package/               # Distribution package (generated)
│   ├── dist/              # Compiled JavaScript
│   ├── bin/               # Executable scripts
│   ├── package.json       # Runtime dependencies
│   └── README.md          # Package documentation
├── Backlog.md/            # Git submodule (official Backlog.md)
├── build.sh               # Build script
├── dev.sh                 # Development convenience script
└── test-mcp.sh            # Integration test script
```

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
# Make changes in source/src/
# Test your changes
./dev.sh validate

# Run full test suite
./test-mcp.sh
```

### Environment Separation

| Aspect | Development | Production |
|--------|-------------|------------|
| **Command** | `./dev.sh` or `node package/bin/backlog-mcp-dev` | `backlog-mcp` |
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
node package/bin/backlog-mcp-dev validate
node package/bin/backlog-mcp-dev start
```

#### Production Installation (for stable use)
```bash
cd package
npm install -g .
backlog-mcp validate
```

## Testing

### Unit Tests
```bash
cd source
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
cd source
npm run lint                        # ESLint
npm run lint:fix                    # Auto-fix issues
npm run typecheck                   # TypeScript check
npm run format                      # Prettier formatting
```

### Manual Testing with Claude Code

#### Add Development Version
```bash
# Replace /absolute/path/to with your actual path
claude mcp add backlog-md-dev -- node /absolute/path/to/Backlog.md-mcp/package/bin/backlog-mcp-dev start
```

#### Switch Between Versions
```bash
# Use development version
claude mcp remove backlog-md
claude mcp add backlog-md-dev -- node /path/to/package/bin/backlog-mcp-dev start

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
rm -rf package/dist/
./build.sh
```

#### Test Failures
```bash
# Check TypeScript compilation
cd source && npm run typecheck

# Run specific test
cd source && npm test -- --grep "specific test"
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

## Contributing

### Development Process

1. **Fork and clone** the repository
2. **Create a feature branch**: `git checkout -b feature/your-feature`
3. **Make changes** in `source/src/`
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
cd package
npm run release  # Check package size, files, and readiness
```

#### 2. Version Bump and Release
```bash
cd package
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
1. Manually update version in `package/package.json`
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

The server (`source/src/server.ts`) implements:
- **Tool handlers** for Backlog.md CLI commands
- **Resource providers** for read-only data access
- **Error handling** and validation
- **Transport layer** (STDIO)

#### Enhancement Functions
- `groupTasksByPriority()` - Priority aggregation with "No Priority" section
- `listDecisionFiles()` - Decision filesystem parsing with status extraction
- Label filtering logic in `task_list` case (client-side implementation)

### CLI Wrapper

The CLI (`source/src/cli.ts`) provides:
- **Command parsing** with Commander.js
- **Configuration management**
- **Validation and setup** tools
- **Development mode** detection

### Configuration System

The config module (`source/src/config.ts`) handles:
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