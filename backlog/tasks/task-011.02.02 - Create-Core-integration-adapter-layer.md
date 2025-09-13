---
id: task-011.02.02
title: Create Core integration adapter layer
status: To Do
assignee: []
created_date: '2025-09-13 01:25'
updated_date: '2025-09-13 01:32'
labels:
  - architecture
  - refactor
dependencies:
  - task-011.02.01
parent_task_id: task-011.02
priority: high
---

## Description

Build an adapter module that maps MCP tool parameters to Backlog.md Core method calls. This abstraction layer will make the migration cleaner and maintainable.

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Adapter class created with Core instance
- [ ] #2 Methods map 1:1 with CLI commands
- [ ] #3 Full TypeScript typing
- [ ] #4 Error handling matches CLI behavior
- [ ] #5 Can be tested independently
<!-- AC:END -->


## Implementation Notes

Core class constructor: new Core(projectRoot: string). Key methods to map: getAllTasks(), createTask(), updateTask(), deleteTask(), getConfig(), etc. Example pattern: execBacklogCommand(['task', 'list']) → core.getAllTasks(). Error handling difference: CLI returns string errors, Core throws exceptions. Must handle async/await properly. Reference Backlog.md src/cli.ts for how Core is used.
