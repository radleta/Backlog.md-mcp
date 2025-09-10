/**
 * Changelog updater module - testable functions for updating CHANGELOG.md
 * Extracted from update-changelog.js script for better testability
 */

import { readFileSync, writeFileSync } from 'fs';

export interface ChangelogUpdateResult {
  success: boolean;
  message: string;
  skipped?: boolean;
}

export interface ChangelogUpdateOptions {
  changelogPath: string;
  version: string;
  dryRun?: boolean;
}

/**
 * Updates changelog by moving Unreleased content to a new version section
 */
export function updateChangelog(options: ChangelogUpdateOptions): ChangelogUpdateResult {
  const { changelogPath, version, dryRun = false } = options;

  try {
    const content = readFileSync(changelogPath, 'utf8');
    const result = processChangelogContent(content, version);
    
    if (result.skipped) {
      return result;
    }

    if (!dryRun && result.success && result.newContent) {
      writeFileSync(changelogPath, result.newContent);
    }

    return {
      success: true,
      message: `✅ ${dryRun ? 'Would update' : 'Updated'} CHANGELOG.md with version ${version}`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Error updating changelog: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Process changelog content and return the updated content
 */
export function processChangelogContent(content: string, version: string): {
  success: boolean;
  message: string;
  skipped?: boolean;
  newContent?: string;
} {
  const lines = content.split('\n');

  // Find the Unreleased section
  const unreleasedIndex = lines.findIndex(line => line.includes('## [Unreleased]'));
  if (unreleasedIndex === -1) {
    return {
      success: false,
      message: 'Could not find [Unreleased] section in CHANGELOG.md',
    };
  }

  // Find the next section (or end of file)
  let nextSectionIndex = lines.length;
  for (let i = unreleasedIndex + 1; i < lines.length; i++) {
    if (lines[i]?.startsWith('## [')) {
      nextSectionIndex = i;
      break;
    }
  }

  // Extract unreleased content
  const unreleasedContent = lines.slice(unreleasedIndex + 1, nextSectionIndex);
  
  // Check if there's any meaningful content in the Unreleased section
  const hasContent = hasUnreleasedContent(unreleasedContent);

  if (!hasContent) {
    return {
      success: true,
      skipped: true,
      message: 'No changes in Unreleased section, skipping changelog update',
    };
  }

  // Create the new version section
  const today = new Date().toISOString().split('T')[0];
  const newVersionHeader = `## [${version}] - ${today}`;

  // Create new content
  const newLines = [
    ...lines.slice(0, unreleasedIndex),
    '## [Unreleased]',
    '',
    newVersionHeader,
    ...unreleasedContent,
    ...lines.slice(nextSectionIndex),
  ];

  return {
    success: true,
    message: `Processed changelog for version ${version}`,
    newContent: newLines.join('\n'),
  };
}

/**
 * Check if the unreleased section has meaningful content
 */
export function hasUnreleasedContent(unreleasedLines: string[]): boolean {
  const emptyHeaders = ['### Added', '### Changed', '### Fixed', '### Removed', '### Deprecated', '### Security'];
  
  return unreleasedLines.some(line => {
    const trimmed = line.trim();
    
    // Skip empty lines, section headers, and subsection headers
    if (!trimmed || trimmed.startsWith('##') || emptyHeaders.includes(trimmed)) {
      return false;
    }
    
    // This line has actual content
    return true;
  });
}

/**
 * Parse version argument from command line or environment
 */
export function parseVersionArgument(args: string[], env: Record<string, string | undefined>): string | null {
  // Check command line argument first
  if (args.length > 2) {
    return args[2] || null;
  }
  
  // Check environment variable (used by npm version scripts)
  if (env.npm_package_version) {
    return env.npm_package_version;
  }
  
  return null;
}

/**
 * Validate that a version string is reasonable
 */
export function isValidVersion(version: string): boolean {
  // Basic semver pattern check
  const semverPattern = /^\d+\.\d+\.\d+(-[\w.-]+)?(\+[\w.-]+)?$/;
  return semverPattern.test(version);
}