---
id: task-025
title: >-
  Fix shell character escaping - support all characters instead of rejecting
  them
status: Done
assignee: []
created_date: '2025-09-24 16:37'
updated_date: '2025-09-24 16:37'
labels:
  - bug
  - security
  - shell-escaping
dependencies: []
priority: high
---

## Description

Fixed the issue where the MCP server was incorrectly rejecting special characters like parentheses instead of properly escaping them for safe shell execution. This violated the documented "pass-through philosophy" of preserving user content by escaping rather than removing dangerous characters.

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Remove overly restrictive validateArgumentsEnhanced validation from runBacklogCommand
- [x] #2 Enhance escapeShellArg function to handle all shell metacharacters including newlines, tabs, brackets
- [x] #3 Add minimal validation only for obvious command injection attempts (rm, del, shutdown, etc)
- [x] #4 Update security tests to verify escaping vs rejection behavior
- [x] #5 Ensure parentheses and other special characters are accepted and properly escaped
- [x] #6 All existing tests continue to pass
- [x] #7 Lint and typecheck pass without errors
<!-- AC:END -->


## Implementation Notes

**Root Cause**: The validation logic in `validateArgumentsEnhanced` was rejecting arguments with special characters before they could be escaped by `escapeShellArg`. This backwards order (validate-then-escape instead of escape-then-validate) caused legitimate user input to be blocked.

**Solution**: Replaced restrictive validation with minimal command injection detection, enhanced shell escaping to handle more characters, and updated tests to focus on escaping rather than rejection.

**Impact**: Users can now include any characters (parentheses, quotes, etc.) in their task notes, descriptions, and other text fields without getting "dangerous shell characters" errors.
