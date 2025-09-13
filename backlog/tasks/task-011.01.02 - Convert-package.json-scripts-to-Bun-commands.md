---
id: task-011.01.02
title: Convert package.json scripts to Bun commands
status: To Do
assignee: []
created_date: '2025-09-13 01:25'
updated_date: '2025-09-13 01:32'
labels:
  - build
  - configuration
dependencies:
  - task-011.01.01
parent_task_id: task-011.01
priority: high
---

## Description

Replace all npm/node commands in package.json with Bun equivalents. Update build, test, lint, and dev scripts to use Bun's tooling.

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 npm install → bun install
- [ ] #2 npm run → bun run
- [ ] #3 npm test → bun test
- [ ] #4 node → bun for script execution
- [ ] #5 Build script uses bun build instead of tsc
<!-- AC:END -->


## Implementation Notes

Reference carlosedp/mcp-bun package.json which uses: "build": "bun run tsc", "dist": "bun build src/mcp-bun.ts --outdir dist --target bun --minify". Key changes: npm install → bun install, npm test → bun test, node → bun for execution. Keep both npm and bun scripts during transition for compatibility.
