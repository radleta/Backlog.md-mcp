---
id: task-010
title: Fix Windows PowerShell path resolution for backlog CLI
status: Done
assignee: []
created_date: '2025-09-11 14:31'
updated_date: '2025-09-11 14:31'
labels:
  - bug
  - windows
  - compatibility
dependencies: []
priority: high
---

## Description

Resolved ENOENT errors when MCP server is launched from PowerShell on Windows due to incorrect path resolution for the backlog CLI executable.

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 MCP server detects backlog CLI path correctly in PowerShell
- [x] #2 MCP server detects backlog CLI path correctly in Command Prompt
- [x] #3 MCP server detects backlog CLI path correctly in Git Bash
- [x] #4 Manual path configuration option available
- [x] #5 New detect command helps diagnose path issues
- [x] #6 Enhanced error messages guide users
- [x] #7 Documentation updated with Windows troubleshooting
<!-- AC:END -->


## Implementation Notes

Problem: ENOENT errors in PowerShell when spawning backlog CLI. Root cause was Unix-style hardcoded path resolution. Solution implemented multi-strategy path detection with Windows support, proper spawn handling for cmd/bat files, and new diagnostic commands. All tests pass.
