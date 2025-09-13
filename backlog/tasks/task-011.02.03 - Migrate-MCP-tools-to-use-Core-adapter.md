---
id: task-011.02.03
title: Migrate MCP tools to use Core adapter
status: To Do
assignee: []
created_date: '2025-09-13 01:25'
updated_date: '2025-09-13 01:32'
labels:
  - refactor
  - migration
dependencies:
  - task-011.02.02
parent_task_id: task-011.02
priority: high
---

## Description

Replace all execBacklogCommand calls in MCP tool handlers with Core adapter method calls. Migrate tools incrementally to ensure stability.

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 All read operations use Core
- [ ] #2 All write operations use Core
- [ ] #3 No more CLI spawning
- [ ] #4 All tools tested and working
- [ ] #5 execBacklogCommand removed
<!-- AC:END -->


## Implementation Plan

1. Start with read-only tools (task_list, task_view)
2. Migrate task creation tools
3. Migrate task editing tools
4. Migrate board and config tools
5. Remove execBacklogCommand function


## Implementation Notes

Migration strategy: Start with read-only tools to minimize risk. Current execBacklogCommand spawns process with child_process.spawn(). Direct Core calls will be synchronous/async function calls - much faster. Watch for: 1) CLI output parsing no longer needed, 2) Return types differ (objects vs strings), 3) Some CLI features might not have Core equivalents. Keep commented CLI code for comparison during testing.
