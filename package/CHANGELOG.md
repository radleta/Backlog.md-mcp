# Changelog

All notable changes to the Backlog.md MCP Server will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-09

### Added
- Initial release of Backlog.md MCP Server
- Full integration with Claude Desktop via Model Context Protocol (MCP)
- Interactive setup wizard for easy configuration
- Support for STDIO transport protocol
- Comprehensive CLI with multiple commands:
  - `setup` - Interactive configuration wizard
  - `start` - Start the MCP server
  - `validate` - Verify the installation
  - `config` - Manage configuration settings
  - `info` - Display server information

### Features
- **Task Management Tools**:
  - Create, list, edit, move, and delete tasks
  - Filter tasks by status, priority, and tags
  - Full CRUD operations via natural language

- **Board Operations**:
  - Display Kanban board
  - Visual task management

- **Sprint Management**:
  - Create and manage sprints
  - View current sprint details

- **Configuration Management**:
  - Get and set configuration values
  - Support for multiple Backlog.md installations

### Resources
- `backlog://tasks/all` - View all tasks
- `backlog://board` - Kanban board view
- `backlog://config` - Configuration settings
- `backlog://sprint/current` - Current sprint information

### Developer Features
- TypeScript support with full type definitions
- Comprehensive test suite
- CI/CD pipeline with GitHub Actions
- npm package with automatic post-install setup
- Support for both Node.js and Bun runtimes

### Documentation
- Complete installation guide (INSTALL.md)
- Detailed README with usage examples
- API documentation for developers
- Troubleshooting guide

## [Unreleased]

### Planned Features
- WebSocket support for real-time updates
- Multi-workspace support
- Enhanced error handling and recovery
- Performance monitoring and metrics
- Plugin system for extensions
- Docker container support
- Integration with other AI assistants

---

## Version History

### Pre-release Development
- 2024-01-08: Project inception and planning
- 2024-01-09: Initial implementation and testing

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.