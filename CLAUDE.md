# Backlog.md MCP Server - Claude Instructions

## Documentation Organization

@.github/README.md
@README.md

**Important**: The documentation above is organized by audience:
- **.github/README.md** - For developers contributing to the MCP server codebase (includes development setup, testing, and architecture)
- **README.md** - For users installing and using the MCP server (displayed on npm package page)
- **CLAUDE.md** (this section) - Claude-specific context and guidance

## Claude-Specific Context

### Understanding Your Audiences

When helping with this project, identify which audience you're serving:
- **Users** want to install and use the MCP server with their Backlog.md projects
- **Developers** want to contribute to or modify the MCP server codebase itself

### Effective Task Management Guidance

When using the Backlog.md tools, always consider:
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

### Implementation Notes

Some features are MCP enhancements beyond the native CLI:
- **Label filtering in task_list**: O(n) calls - expensive for large task lists
- **Decision operations**: Efficient - direct filesystem access
- **Resource aggregation**: Multiple CLI calls with in-memory processing

Most operations are direct CLI pass-through for data integrity.

### Key Points to Remember

1. The MCP server is a wrapper around Backlog.md CLI - it doesn't implement custom write logic
2. All security measures preserve user content (escape, don't remove)
3. Interactive commands (like `backlog init`) cannot be implemented through MCP
4. For Claude Code setup, users should use: `claude mcp add backlog-md -- backlog-mcp start`
5. Development documentation is now in .github/README.md, user documentation is in README.md