---
id: task-008.05
title: Pre-publish validation
status: To Do
assignee: []
created_date: '2025-09-10 19:08'
updated_date: '2025-09-10 19:12'
labels:
  - testing
  - validation
dependencies:
  - task-008.01
  - task-008.02
  - task-008.03
  - task-008.04
parent_task_id: task-008
priority: high
---

## Description

Validate package before publishing

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 All tests pass (npm test)
- [ ] #2 TypeScript compiles without errors (npm run typecheck)
- [ ] #3 Linting passes (npm run lint)
- [ ] #4 Package installs locally via npm pack
- [ ] #5 CLI commands work after local install
- [ ] #6 MCP server starts successfully
<!-- AC:END -->
