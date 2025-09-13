---
id: task-011
title: Convert Backlog.md MCP Server to Bun with Direct Integration
status: To Do
assignee: []
created_date: '2025-09-13 01:24'
updated_date: '2025-09-13 01:33'
labels:
  - refactor
  - performance
  - bun
  - mcp
dependencies: []
priority: high
---

## Description

Migrate the Backlog.md MCP server from Node.js/npm to Bun runtime, then refactor to use direct Backlog.md Core integration instead of CLI spawning for improved performance and type safety.

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 MCP server runs successfully with Bun runtime
- [ ] #2 All existing tools work without regression
- [ ] #3 Direct Core integration eliminates CLI spawning
- [ ] #4 TypeScript types fully integrated between MCP and Backlog.md
- [ ] #5 Performance improvement measured and documented
- [ ] #6 All tests pass with new implementation
<!-- AC:END -->


## Implementation Plan

1. Convert build and runtime from Node.js to Bun
2. Update dependencies and configuration
3. Test with existing CLI-based approach
4. Refactor to direct Core integration
5. Remove CLI spawning overhead
6. Full testing of all MCP tools

## Implementation Notes

Research findings: Bun DOES work with StdioServerTransport (proven by carlosedp/mcp-bun). Key requirements: MCP SDK 1.6.0+, Bun 1.0.0+. Current architecture: MCP Server (Node.js) → spawn() → Backlog CLI (Bun binary). Target architecture: MCP Server (Bun) → import → Backlog.md Core (Bun modules). Performance gain: Eliminate ~50-100ms spawn overhead per command. Backlog.md heavily uses Bun APIs (126+ occurrences).
