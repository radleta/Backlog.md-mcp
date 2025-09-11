# Changelog

All notable changes to the Backlog.md MCP Server will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Cross-platform path resolution for backlog CLI executable
  - Automatic detection works across PowerShell, Command Prompt, Git Bash, and Unix shells
  - Multiple detection strategies: system commands, npm paths, common locations, bundled version
  - New `detect` command for diagnosing path resolution issues
  - Enhanced `validate` command with detailed path detection and testing

### Fixed
- **Windows PowerShell Compatibility**: Resolve ENOENT errors when Claude Code launched from PowerShell
  - MCP server now properly detects backlog CLI path on Windows regardless of shell environment
  - Automatic handling of Windows executable extensions (.cmd, .exe, .bat)
  - Improved spawn options for Windows batch files
  - Better error messages with troubleshooting guidance
- Path resolution fallback chain ensures MCP works with global, local, and bundled installations
- Enhanced configuration validation prevents invalid custom paths from causing failures

## [0.1.4] - 2025-09-11

### Fixed
- Fix OIDC Trusted Publishing authentication in release workflow
  - Update npm to latest version (11.5.1+) for OIDC support in GitHub Actions
  - Resolves 404 errors when publishing despite correct npmjs.com configuration
- Clarify release documentation to reflect CI/CD automation
  - Remove misleading manual `npm publish` instructions from build.sh, README.md, and package.json
  - Emphasize that `npm version` triggers full CI/CD release pipeline
  - Correct release script message to indicate automated publishing

## [0.1.3] - 2025-09-11

### Added
- Comprehensive GitHub Actions documentation (.github/workflows/README.md)
  - Complete CI/CD pipeline documentation for contributors and maintainers
  - OIDC Trusted Publishing setup instructions with step-by-step configuration
  - Security best practices and troubleshooting guide
  - Workflow triggers, test matrix, and release process documentation

### Changed
- **BREAKING**: Migrate from npm tokens to OIDC Trusted Publishing for secure releases
  - GitHub Actions workflows now use OpenID Connect (OIDC) for token-free authentication
  - Added id-token: write permission to release workflow
  - Removed NODE_AUTH_TOKEN dependency from npm publishing step
  - Enhanced security with short-lived, workflow-specific credentials
  - Automatic provenance attestations for improved supply chain security
- Fix GitHub Actions release workflow build order
  - Build step now runs before tests to prevent "dist not found" failures
  - Consistent npm ci → npm run build → npm test sequence across all workflows
  - Standardized build commands for CI/CD pipeline reliability

### Fixed
- Move npm README to root as README (without extension) for proper npm package page display
  - Moved npm/README.md to root as README to fix npm display issue
  - Updated package.json files array to reference README instead of npm/README.md
  - Updated CLAUDE.md documentation references
  - Removed empty npm directory
- Update tests to reflect new README structure
  - Renamed test suite from "NPM Package Structure" to "Package Documentation Structure"
  - Updated tests to verify README (user docs) and README.md (developer docs) exist
  - All 87 tests now pass after README reorganization
- Make test files robust for missing build artifacts
  - CLI integration tests gracefully skip when dist/cli.js doesn't exist
  - Build output tests provide helpful warnings for unbuilt projects
  - Tests work in both development (unbuilt) and CI (built) environments
- Add spell check configuration (.vscode/settings.json)
  - Fixed cSpell warnings for project-specific terms (npmjs, exfiltrated, OIDC)
  - Improved VS Code development experience

## [0.1.2] - 2025-09-11

### Fixed
- Use bunfig.toml for consistent cross-platform test execution
- Update test command paths for Windows compatibility  
- Update GitHub Actions workflows for consolidated directory structure

## [0.1.1] - 2025-09-11

### Changed
- **BREAKING**: Consolidated project structure into single root package
  - Merged source/ and package/ directories into unified root structure  
  - Moved TypeScript source files from source/src/ to src/
  - Moved tests from source/test/ to test/
  - Moved build scripts to root scripts/ directory
  - Updated all build and development workflows for new structure
  - Created npm/ directory for package-specific documentation (npm/README.md)
- Updated all path references in documentation and scripts
- Unified package.json with merged dependencies and updated paths
- Updated TypeScript configuration for new directory structure
- Updated README.md project structure diagram and all path references
- Updated CLAUDE.md to reference npm/README.md instead of package/README.md
- Maintained separation between developer docs (root README.md) and user docs (npm/README.md)
- Fixed all command examples and development workflow instructions
- Updated CHANGELOG.md with recent commits since v0.1.0
- Improved package README.md for npm users
- Reorganized documentation and fixed repository URLs
- Completed task-008 npm publishing milestone and archive

### Added
- ES module support to eliminate npm version script warnings
- Git commands to allowed permissions in settings.local.json

### Fixed  
- Fixed test configuration to exclude Backlog.md submodule tests
- Updated all shell scripts (build.sh, dev.sh, test-mcp.sh) for new paths
- Corrected bin script paths in package.json and development workflows
- Fixed all documentation path references from old structure

### Tested
- Verified all 88 tests pass with new structure
- Completed comprehensive smoke test of MCP functionality
- Confirmed all tools work correctly after consolidation
- Validated build, lint, and typecheck processes

## [0.1.0] - 2025-09-11

### Security
- Added comprehensive security measures to prevent command injection, path traversal, and prototype pollution attacks
- Implemented input validation and sanitization for all user inputs
- Added escapeShellArg() function to safely escape shell metacharacters while preserving content
- Added validateArguments() to detect potentially malicious command patterns
- Added sanitizePath() and isPathAllowed() for path traversal protection
- Added isValidConfigKey() to prevent prototype pollution in configuration operations
- All security measures follow pass-through philosophy - escape don't remove

### Added
- Automated npm publishing workflow with lifecycle scripts
  - `prepublishOnly` script runs full validation (tests, lint, typecheck, build) before publishing
  - `version` script automatically updates CHANGELOG.md when version is bumped
  - `postversion` script pushes git commits and tags to remote repository
  - `pack:dry` and `size:check` utility scripts for package validation
  - `release` script for pre-release verification
- MCP (Model Context Protocol) server for Backlog.md task management
- Full integration with Claude Code via STDIO transport
- Comprehensive CLI with commands:
  - `setup` - Interactive configuration wizard
  - `start` - Start the MCP server
  - `validate` - Verify the installation
  - `config` - Manage configuration settings
  - `info` - Display server information

### Task Management Tools
- `task_create` - Create tasks with full support for title, description, status, priority, labels, assignee, plan, notes, acceptance criteria, dependencies, parent tasks, and draft mode
- `task_list` - List tasks with filtering by status, label, priority, assignee, parent task ID, and sorting options
- `task_edit` - Edit tasks with comprehensive property support and acceptance criteria management
- `task_view` - View detailed task information
- `task_archive` - Archive tasks
- `task_demote` - Demote tasks to draft status
- `task_dependencies` - View dependency graph for tasks
- `task_children` - List all children of parent tasks

### Draft Management
- `draft_create` - Create draft tasks
- `draft_list` - List all draft tasks
- `draft_promote` - Promote draft tasks to full tasks
- `draft_archive` - Archive draft tasks
- `draft_view` - View draft task details

### Documentation & Decision Records
- `doc_create` - Create documentation files with optional path and type
- `doc_list` - List all documentation files
- `doc_view` - View specific documentation files
- `decision_create` - Create decision records with status
- `decision_list` - List all decision records with status parsing

### Board & Project Management
- `board_show` - Display the Kanban board
- `board_export` - Export Kanban board to markdown with customization options
- `overview` - Show project statistics and overview
- `cleanup` - Move old completed tasks to archive folder
- `sequence_list` - List execution sequences from task dependencies

### Configuration & Utilities
- `config_get/set/list` - Configuration management
- `browser` - Launch web interface
- `agents_update` - Update agent instruction files

### MCP Resources
- `backlog://tasks/all` - View all tasks
- `backlog://board` - Kanban board view
- `backlog://config` - Configuration settings
- `backlog://drafts/all` - View all draft tasks
- `backlog://docs/all` - View all documentation files
- `backlog://decisions/all` - View all decision records
- `backlog://tasks/by-priority` - Tasks grouped by priority
- `backlog://statistics` - Enhanced project statistics
- `backlog://overview` - Project overview
- `backlog://sequences` - Task execution sequences

### Developer Features
- TypeScript support with full type definitions
- Dual-environment development workflow (production/development modes)
- CI/CD pipeline with GitHub Actions
- npm package configuration for publishing
- Build and test automation scripts

### Documentation
- Complete installation guide (INSTALL.md)
- Detailed README with usage examples and enhancement matrix
- Internal development documentation (CLAUDE.md)