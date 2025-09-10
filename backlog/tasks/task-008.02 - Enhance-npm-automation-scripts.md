---
id: task-008.02
title: Enhance npm automation scripts
status: To Do
assignee: []
created_date: '2025-09-10 19:07'
updated_date: '2025-09-10 19:12'
labels:
  - npm
  - automation
  - scripts
dependencies:
  - task-008.01
parent_task_id: task-008
priority: high
---

## Description

Add npm lifecycle scripts for automated publishing workflow

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 prepublishOnly script runs tests before publish
- [ ] #2 version script updates CHANGELOG.md automatically
- [ ] #3 postversion script pushes git tags
- [ ] #4 npm pack --dry-run shows correct files included
- [ ] #5 Package size is reasonable (<1MB)
<!-- AC:END -->
