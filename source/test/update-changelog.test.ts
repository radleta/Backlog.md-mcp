import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { readFileSync, writeFileSync, mkdtempSync, rmSync, copyFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import {
  updateChangelog,
  processChangelogContent,
  hasUnreleasedContent,
  parseVersionArgument,
  isValidVersion,
} from '../src/changelog-updater';

describe('Changelog Updater', () => {
  let tempDir: string;

  beforeEach(() => {
    // Create temporary directory for each test
    tempDir = mkdtempSync(join(tmpdir(), 'changelog-test-'));
  });

  afterEach(() => {
    // Clean up temporary directory
    rmSync(tempDir, { recursive: true, force: true });
  });

  describe('processChangelogContent', () => {
    test('should move unreleased content to new version section', () => {
      const content = readFileSync(join(__dirname, 'fixtures/test-changelog-basic.md'), 'utf8');
      const result = processChangelogContent(content, '1.1.0');

      expect(result.success).toBe(true);
      expect(result.skipped).toBeFalsy();
      expect(result.newContent).toBeDefined();

      const lines = result.newContent!.split('\n');
      
      // Should have empty Unreleased section
      const unreleasedIndex = lines.findIndex(line => line.includes('## [Unreleased]'));
      expect(unreleasedIndex).toBeGreaterThan(-1);
      
      // Should have new version section
      const versionIndex = lines.findIndex(line => line.includes('## [1.1.0]'));
      expect(versionIndex).toBeGreaterThan(-1);
      expect(versionIndex).toBeGreaterThan(unreleasedIndex);
      
      // Version should have today's date
      const today = new Date().toISOString().split('T')[0];
      expect(lines[versionIndex]).toContain(today);
      
      // Content should be moved to new version
      expect(result.newContent).toContain('## [1.1.0]');
      expect(result.newContent).toContain('New feature X for better user experience');
      expect(result.newContent).toContain('Bug in authentication module');
    });

    test('should preserve existing version history', () => {
      const content = readFileSync(join(__dirname, 'fixtures/test-changelog-basic.md'), 'utf8');
      const result = processChangelogContent(content, '1.1.0');

      expect(result.success).toBe(true);
      expect(result.newContent).toContain('## [1.0.0] - 2024-01-15');
      expect(result.newContent).toContain('Initial release');
    });

    test('should handle complex changelog with multiple sections', () => {
      const content = readFileSync(join(__dirname, 'fixtures/test-changelog-complex.md'), 'utf8');
      const result = processChangelogContent(content, '2.2.0');

      expect(result.success).toBe(true);
      
      // Should preserve all sections
      expect(result.newContent).toContain('Multi-line feature description');
      expect(result.newContent).toContain('Sub-item 1');
      expect(result.newContent).toContain('**Bold text** and _italic text_ support');
      expect(result.newContent).toContain('Critical security vulnerability');
      expect(result.newContent).toContain('Old API endpoints');
      expect(result.newContent).toContain('Updated vulnerable dependencies');
      
      // Should preserve all existing versions
      expect(result.newContent).toContain('## [2.1.0] - 2024-03-15');
      expect(result.newContent).toContain('## [1.5.1] - 2024-01-20');
    });

    test('should skip update when unreleased section is empty', () => {
      const content = readFileSync(join(__dirname, 'fixtures/test-changelog-empty-unreleased.md'), 'utf8');
      const result = processChangelogContent(content, '1.1.0');

      expect(result.success).toBe(true);
      expect(result.skipped).toBe(true);
      expect(result.message).toContain('No changes in Unreleased section');
      expect(result.newContent).toBeUndefined();
    });

    test('should handle minimal changelog format', () => {
      const content = readFileSync(join(__dirname, 'fixtures/test-changelog-minimal.md'), 'utf8');
      const result = processChangelogContent(content, '1.1.0');

      expect(result.success).toBe(true);
      expect(result.newContent).toContain('- Simple change without subsections');
      expect(result.newContent).toContain('## [1.1.0]');
    });

    test('should fail when no unreleased section exists', () => {
      const content = readFileSync(join(__dirname, 'fixtures/test-changelog-no-unreleased.md'), 'utf8');
      const result = processChangelogContent(content, '1.1.0');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Could not find [Unreleased] section');
    });

    test('should handle edge case with malformed input', () => {
      const content = '# Changelog\n\nSome content without proper sections.';
      const result = processChangelogContent(content, '1.0.0');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Could not find [Unreleased] section');
    });
  });

  describe('hasUnreleasedContent', () => {
    test('should detect content in unreleased section', () => {
      const lines = [
        '',
        '### Added',
        '- New feature X',
        '- Another feature',
        '',
        '### Fixed',
        '- Bug fix',
      ];

      expect(hasUnreleasedContent(lines)).toBe(true);
    });

    test('should return false for empty sections with only headers', () => {
      const lines = [
        '',
        '### Added',
        '',
        '### Changed',
        '',
        '### Fixed',
        '',
      ];

      expect(hasUnreleasedContent(lines)).toBe(false);
    });

    test('should return false for completely empty section', () => {
      const lines = ['', ''];
      expect(hasUnreleasedContent(lines)).toBe(false);
    });

    test('should detect content even with mixed empty headers', () => {
      const lines = [
        '### Added',
        '- Actual content here',
        '',
        '### Changed', 
        '',
        '### Fixed',
      ];

      expect(hasUnreleasedContent(lines)).toBe(true);
    });
  });

  describe('updateChangelog', () => {
    test('should update changelog file when dry run is false', () => {
      const testFile = join(tempDir, 'test-changelog.md');
      copyFileSync(join(__dirname, 'fixtures/test-changelog-basic.md'), testFile);

      const result = updateChangelog({
        changelogPath: testFile,
        version: '1.1.0',
        dryRun: false,
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('Updated CHANGELOG.md with version 1.1.0');

      // Verify file was actually updated
      const updatedContent = readFileSync(testFile, 'utf8');
      expect(updatedContent).toContain('## [1.1.0]');
      expect(updatedContent).toContain('New feature X for better user experience');
    });

    test('should not modify file when dry run is true', () => {
      const testFile = join(tempDir, 'test-changelog.md');
      copyFileSync(join(__dirname, 'fixtures/test-changelog-basic.md'), testFile);
      const originalContent = readFileSync(testFile, 'utf8');

      const result = updateChangelog({
        changelogPath: testFile,
        version: '1.1.0',
        dryRun: true,
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('Would update CHANGELOG.md with version 1.1.0');

      // Verify file was not modified
      const unchangedContent = readFileSync(testFile, 'utf8');
      expect(unchangedContent).toBe(originalContent);
    });

    test('should handle file read errors gracefully', () => {
      const nonExistentFile = join(tempDir, 'does-not-exist.md');

      const result = updateChangelog({
        changelogPath: nonExistentFile,
        version: '1.0.0',
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('Error updating changelog');
    });

    test('should skip update for empty unreleased section', () => {
      const testFile = join(tempDir, 'test-changelog.md');
      copyFileSync(join(__dirname, 'fixtures/test-changelog-empty-unreleased.md'), testFile);

      const result = updateChangelog({
        changelogPath: testFile,
        version: '1.1.0',
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('No changes in Unreleased section');
    });
  });

  describe('parseVersionArgument', () => {
    test('should parse version from command line arguments', () => {
      const args = ['node', 'script.js', '1.2.3'];
      const env = {};
      
      const version = parseVersionArgument(args, env);
      expect(version).toBe('1.2.3');
    });

    test('should parse version from npm environment variable', () => {
      const args = ['node', 'script.js'];
      const env = { npm_package_version: '2.1.0' };
      
      const version = parseVersionArgument(args, env);
      expect(version).toBe('2.1.0');
    });

    test('should prefer command line over environment', () => {
      const args = ['node', 'script.js', '3.0.0'];
      const env = { npm_package_version: '2.1.0' };
      
      const version = parseVersionArgument(args, env);
      expect(version).toBe('3.0.0');
    });

    test('should return null when no version available', () => {
      const args = ['node', 'script.js'];
      const env = {};
      
      const version = parseVersionArgument(args, env);
      expect(version).toBeNull();
    });
  });

  describe('isValidVersion', () => {
    test('should accept valid semver versions', () => {
      expect(isValidVersion('1.0.0')).toBe(true);
      expect(isValidVersion('1.2.3')).toBe(true);
      expect(isValidVersion('10.20.30')).toBe(true);
    });

    test('should accept versions with pre-release identifiers', () => {
      expect(isValidVersion('1.0.0-alpha')).toBe(true);
      expect(isValidVersion('1.0.0-alpha.1')).toBe(true);
      expect(isValidVersion('1.0.0-beta.2')).toBe(true);
    });

    test('should accept versions with build metadata', () => {
      expect(isValidVersion('1.0.0+20240101')).toBe(true);
      expect(isValidVersion('1.0.0-alpha+build.1')).toBe(true);
    });

    test('should reject invalid version formats', () => {
      expect(isValidVersion('1.0')).toBe(false);
      expect(isValidVersion('1')).toBe(false);
      expect(isValidVersion('v1.0.0')).toBe(false);
      expect(isValidVersion('1.0.0.0')).toBe(false);
      expect(isValidVersion('abc')).toBe(false);
      expect(isValidVersion('')).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    test('should create proper version entry with correct date format', () => {
      const content = readFileSync(join(__dirname, 'fixtures/test-changelog-basic.md'), 'utf8');
      const result = processChangelogContent(content, '1.1.0');

      expect(result.success).toBe(true);
      
      // Check date format (YYYY-MM-DD)
      const today = new Date().toISOString().split('T')[0];
      const dateRegex = /## \[1\.1\.0\] - \d{4}-\d{2}-\d{2}/;
      expect(result.newContent).toMatch(dateRegex);
      expect(result.newContent).toContain(`## [1.1.0] - ${today}`);
    });

    test('should preserve indentation and formatting', () => {
      const content = readFileSync(join(__dirname, 'fixtures/test-changelog-complex.md'), 'utf8');
      const result = processChangelogContent(content, '2.2.0');

      expect(result.success).toBe(true);
      
      // Check that nested lists are preserved
      expect(result.newContent).toContain('  - Sub-item 1');
      expect(result.newContent).toContain('  - Sub-item 2');
      expect(result.newContent).toContain('    - Nested sub-item');
      
      // Check that markdown formatting is preserved
      expect(result.newContent).toContain('**Bold text** and _italic text_ support');
      expect(result.newContent).toContain('**BREAKING:** API endpoint structure');
    });

    test('should handle multiple consecutive releases', () => {
      // Simulate multiple version updates
      let content = readFileSync(join(__dirname, 'fixtures/test-changelog-basic.md'), 'utf8');
      
      // First update
      let result = processChangelogContent(content, '1.1.0');
      expect(result.success).toBe(true);
      
      // Add some new unreleased content
      content = result.newContent!.replace(
        '## [Unreleased]\n',
        '## [Unreleased]\n\n### Added\n- Another new feature\n'
      );
      
      // Second update
      result = processChangelogContent(content, '1.2.0');
      expect(result.success).toBe(true);
      
      // Should have both versions
      expect(result.newContent).toContain('## [1.2.0]');
      expect(result.newContent).toContain('## [1.1.0]');
      expect(result.newContent).toContain('## [1.0.0]');
      expect(result.newContent).toContain('Another new feature');
    });
  });
});