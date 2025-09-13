---
id: task-011.01.03
title: Update build and dev scripts for Bun
status: To Do
assignee: []
created_date: '2025-09-13 01:25'
labels:
  - scripts
  - build
dependencies:
  - task-011.01.02
parent_task_id: task-011.01
priority: medium
---

## Description

Modify build.sh, dev.sh, and test-mcp.sh scripts to use Bun commands. Update bin scripts to run with Bun instead of Node.js.

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 build.sh uses bun instead of npm
- [ ] #2 dev.sh runs with bun
- [ ] #3 test-mcp.sh updated for Bun
- [ ] #4 Bin scripts have #!/usr/bin/env bun shebang
- [ ] #5 All scripts execute successfully
<!-- AC:END -->
