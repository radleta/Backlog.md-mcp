#!/usr/bin/env node

/**
 * Automatically update CHANGELOG.md when version is bumped
 * This script moves "Unreleased" content to a new version section
 */

import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { updateChangelog, parseVersionArgument, isValidVersion } from '../../package/dist/changelog-updater.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function main() {
  // Parse version from command line or environment
  const version = parseVersionArgument(process.argv, process.env);

  if (!version) {
    console.error('Usage: node update-changelog.js <version>');
    console.error('Or run via npm version script where npm_package_version is available');
    process.exit(1);
  }

  // Validate version format
  if (!isValidVersion(version)) {
    console.error(`Invalid version format: ${version}`);
    console.error('Expected semantic version format (e.g., 1.0.0, 1.0.0-alpha, 1.0.0+build)');
    process.exit(1);
  }

  // Update the changelog
  const changelogPath = join(__dirname, '../../package/CHANGELOG.md');
  const result = updateChangelog({
    changelogPath,
    version,
    dryRun: false,
  });

  if (result.success) {
    if (result.skipped) {
      console.log(result.message);
    } else {
      console.log(result.message);
    }
  } else {
    console.error(result.message);
    process.exit(1);
  }
}

main();