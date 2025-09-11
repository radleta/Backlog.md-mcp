# GitHub Actions Documentation

## Overview

This repository uses GitHub Actions for continuous integration (CI) and automated publishing. The CI/CD pipeline is designed to ensure code quality, run comprehensive tests, and automate releases to npm.

### Workflow Architecture

```
Pull Request → CI Workflow (ci.yml) → Tests & Validation
Git Tag Push → Release Workflow (release.yml) → Build → Test → Publish → GitHub Release
```

## Workflows

### CI Workflow (`ci.yml`)

**Triggers:**
- Push to `main` branch
- Pull requests to `main` branch

**Test Matrix:**
- **Operating Systems**: Ubuntu, Windows, macOS
- **Node.js Versions**: 18.x, 20.x
- **Runtime**: Node.js + Bun (for testing)

**Jobs:**
1. **test**: Basic test suite across all OS/Node combinations
2. **build-full**: Full build verification including CLI tests
3. **validate-package**: Package validation and ES module compatibility

**Required Secrets:** None (uses default `GITHUB_TOKEN`)

### Release Workflow (`release.yml`)

**Triggers:**
- Git tags matching pattern `v*` (e.g., `v1.0.0`, `v0.1.2`)
- Manual dispatch with version input

**Process:**
1. Checkout code with submodules
2. Setup Node.js 20.x and Bun
3. Install dependencies (`npm ci`)
4. **Build project** (`npm run build`)
5. **Run tests** (`npm test`)
6. Set version (manual trigger only)
7. Create npm package tarball
8. Publish to npm registry
9. Create GitHub release with assets

## Required Secrets

### For Repository Maintainers

#### NPM Publishing Authentication (OIDC Trusted Publishing)

**Purpose:** Secure, token-free authentication for npm package publishing using OpenID Connect (OIDC)

**Benefits:**
- No tokens to manage, rotate, or accidentally expose
- Short-lived, workflow-specific credentials
- Automatic provenance attestations for supply chain security
- Industry-standard security (OpenSSF compliant)

**Setup Instructions:**

1. **Configure npm Package for Trusted Publishing:**
   - Log in to [npmjs.com](https://www.npmjs.com)
   - Navigate to your package: `@radleta/backlog-md-mcp`
   - Go to **Settings** → **Publishing Access**
   - Click **Add Trusted Publisher**
   - Configure GitHub Actions publisher:
     - **GitHub Username/Organization:** `radleta`
     - **Repository:** `Backlog.md-mcp`
     - **Workflow File:** `release.yml`
     - **Environment:** (leave blank unless using environments)
   - Click **Add Publisher**

2. **Workflow Already Configured:**
   The release workflow includes the required OIDC permission and npm version update:
   ```yaml
   permissions:
     contents: write    # For GitHub releases
     id-token: write    # For OIDC authentication
   
   steps:
     - name: Update npm to latest version for OIDC support
       run: |
         npm install -g npm@latest
         npm --version
   ```

**Note:** No secrets configuration needed! OIDC handles authentication automatically.

**Requirements:** npm CLI version 11.5.1+ is required for OIDC support (automatically updated in workflow).

#### GITHUB_TOKEN (Automatically Provided)

Automatically provided by GitHub Actions for creating releases. No setup required.

### For Contributors/Forks

Most contributors don't need any setup - OIDC handles authentication automatically. Only needed if publishing their own version of the package.

## Setup Instructions

### For Fork Maintainers

1. **Fork the repository**
2. **Enable GitHub Actions** in your fork:
   - Go to the **Actions** tab
   - Click **Enable Actions**
3. **Configure Trusted Publishing** (only if you plan to publish):
   - Configure trusted publisher on npmjs.com for your fork
   - Use your own npm account and package name
4. **Test workflows:**
   - Create a pull request to trigger CI
   - Create a tag to test release workflow (optional)

### For Local Development

**Testing Changes Locally:**
```bash
# Install dependencies
npm ci

# Build and test (same as CI)
npm run build
npm test

# Full build script (includes validation)
./build.sh

# Development workflow
./dev.sh validate
```

**Testing with act (Local GitHub Actions):**
```bash
# Install act: https://github.com/nektos/act
# Test CI workflow
act pull_request

# Test release workflow (requires secrets)
act push -s NPM_TOKEN=your_token_here
```

## Workflow Details

### Build Order (Important)

Both workflows follow the same pattern:
1. **Dependencies** → **Build** → **Test** → **Package/Publish**

This order ensures that:
- Tests run against built code (required for CLI integration tests)
- Package validation happens after successful build
- No publishing occurs if tests fail

### Test Behavior

**With Built Code (CI/Release):**
- All tests run, including CLI integration tests
- Validates dist directory and compiled files
- Tests actual CLI commands

**Without Built Code (Development):**
- Tests gracefully skip build-dependent checks
- Shows warnings: `"Skipping test - project not built"`
- Allows development testing without requiring build

### Release Process

**Automated Release (Recommended):**
1. Use npm version command to bump version:
   ```bash
   npm version patch  # or minor, major
   ```
2. This automatically:
   - Updates `package.json` version
   - Updates `CHANGELOG.md`
   - Creates git tag
   - Pushes to repository
3. GitHub Actions automatically publishes the release

**Manual Release:**
1. Go to **Actions** tab in GitHub
2. Select **Release** workflow
3. Click **Run workflow**
4. Enter version number (e.g., `1.0.1`)
5. Click **Run workflow**

## Troubleshooting

### Common Issues

#### Tests Fail with "dist not found"
**Problem:** Tests expect built files but project wasn't built first
**Solution:** Ensure workflow builds before testing (fixed in release.yml)

#### NPM Publish Fails
**Problem:** Publishing to npm fails
**Solutions:**
- Verify Trusted Publisher is configured on npmjs.com
- Check GitHub username/org and repository name match exactly
- Ensure workflow filename matches configuration (release.yml)
- Verify package name matches in package.json
- Check you have maintainer access to the npm package

#### Release Not Created
**Problem:** GitHub release creation fails
**Solutions:**
- Verify tag format matches `v*.*.*` pattern
- Check GITHUB_TOKEN permissions in workflow
- Ensure repository has releases enabled

#### Build Fails on Windows/macOS
**Problem:** Platform-specific issues
**Solutions:**
- Check shell script permissions (Unix only)
- Verify cross-platform file paths
- Use bash shell for Windows PowerShell issues

#### Package Size Too Large
**Problem:** npm publish rejects large packages
**Solutions:**
- Check `.npmignore` file
- Verify only necessary files in `files` array
- Run `npm pack --dry-run` to see included files

### Debug Mode

Enable verbose logging in workflows by adding:
```yaml
- name: Debug Step
  run: echo "Debug info here"
  env:
    DEBUG: "*"
```

### Getting Help

**For workflow issues:**
- Check the **Actions** tab for detailed logs
- Compare with successful runs
- Review this documentation

**For package issues:**
- See main [README.md](../../README.md)
- Check [Contributing Guidelines](../../README.md#contributing)

**For security concerns:**
- Never commit tokens or secrets to code
- Use repository secrets for sensitive values
- Rotate tokens if compromised

---

## Security Best Practices

1. **Publishing Security:**
   - Uses OIDC Trusted Publishing (no tokens needed)
   - Automatic provenance attestations
   - Workflow-specific, short-lived credentials
   - Cannot be exfiltrated or reused

2. **Repository Security:**
   - Enable branch protection on main
   - Require status checks for PRs
   - Require reviews for sensitive changes

3. **Workflow Security:**
   - Pin action versions to specific commits
   - Review third-party actions before use
   - Limit workflow permissions to minimum required

4. **Secret Handling:**
   - Never log secrets in workflow output
   - Use repository secrets, not environment variables
   - Audit secret access regularly

---

*Last updated: 2025-01-11 - Keep this documentation in sync with workflow changes*