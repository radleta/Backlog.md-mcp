---
id: task-011.02
title: 'Phase 2: Migrate from CLI to Direct Backlog.md Core Integration'
status: To Do
assignee: []
created_date: '2025-09-13 01:24'
labels:
  - integration
  - performance
  - refactor
dependencies:
  - task-011.01
parent_task_id: task-011
priority: high
---

## Description

Refactor the Bun-based MCP server to use direct imports from Backlog.md Core modules instead of spawning CLI commands. This eliminates process overhead and provides full TypeScript integration.

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Backlog.md fork is properly integrated
- [ ] #2 Core class imported and instantiated successfully
- [ ] #3 All CLI spawn calls replaced with direct methods
- [ ] #4 TypeScript types flow between MCP and Backlog.md
- [ ] #5 All MCP tools function correctly
- [ ] #6 Performance metrics show improvement
- [ ] #7 No CLI process spawning remains
<!-- AC:END -->

## Implementation Plan

1. Fork Backlog.md repository
2. Set up fork as git submodule or local dependency
3. Import Core class from Backlog.md
4. Replace execBacklogCommand with direct Core method calls
5. Update all MCP tool handlers
6. Remove CLI spawning code
7. Test all tools with direct integration
8. Measure and document performance improvements

## Implementation Notes

This phase depends on successful Bun conversion. Each tool handler needs careful mapping from CLI args to Core method parameters. Consider keeping CLI fallback initially for debugging.
