# Changelog

All notable changes to the Backlog.md MCP Server will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
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