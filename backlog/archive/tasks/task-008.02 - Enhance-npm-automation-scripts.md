---
id: task-008.02
title: Enhance npm automation scripts
status: Done
assignee: []
created_date: '2025-09-10 19:07'
updated_date: '2025-09-10 21:11'
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
- [x] #1 prepublishOnly script runs tests before publish
- [x] #2 version script updates CHANGELOG.md automatically
- [x] #3 postversion script pushes git tags
- [x] #4 npm pack --dry-run shows correct files included
- [x] #5 Package size is reasonable (<1MB)
<!-- AC:END -->
