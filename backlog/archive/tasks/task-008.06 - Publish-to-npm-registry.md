---
id: task-008.06
title: Publish to npm registry
status: Done
assignee: []
created_date: '2025-09-10 19:08'
updated_date: '2025-09-11 01:07'
labels:
  - npm
  - publish
  - release
dependencies:
  - task-008.05
parent_task_id: task-008
priority: high
---

## Description

Execute the actual npm publish

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Git tag v0.1.0 created and pushed
- [ ] #2 npm publish executed successfully
- [ ] #3 Package visible on npmjs.com
- [ ] #4 Installation works: npm install @radleta/backlog-md-mcp
- [ ] #5 GitHub release created with changelog
<!-- AC:END -->
