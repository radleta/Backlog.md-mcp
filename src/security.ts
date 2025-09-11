/**
 * Security utilities for the Backlog.md MCP server
 * Provides input sanitization and validation to prevent security vulnerabilities
 */

/**
 * Sanitizes task IDs by removing shell metacharacters
 * @param id The task ID to sanitize
 * @returns The sanitized task ID
 */
export function sanitizeTaskId(id: string): string {
  return id.replace(/[;|&`$()\\]/g, '');
}

/**
 * Validates command line arguments for dangerous patterns
 * @param args Array of command arguments to validate
 * @returns true if arguments are safe, false otherwise
 */
export function validateArguments(args: string[]): boolean {
  return args.every(arg => !arg.match(/[;|&`$()\\]/));
}

/**
 * Escapes shell arguments to prevent command injection
 * Works for both Unix shells and Windows PowerShell/cmd
 * @param arg The argument to escape
 * @returns The safely escaped argument
 */
export function escapeShellArg(arg: string): string {
  // If argument has no special characters or spaces, return as-is
  if (!arg.match(/[\s;|&`$()\\'"]/)) {
    return arg;
  }
  
  // On Windows (PowerShell/cmd), use double quotes and escape internal quotes
  if (process.platform === 'win32') {
    // Escape any existing double quotes by doubling them
    const escaped = arg.replace(/"/g, '""');
    return `"${escaped}"`;
  }
  
  // On Unix systems, use single quotes and escape internal single quotes
  return `'${arg.replace(/'/g, "\\'")}'`;
}

/**
 * Sanitizes file paths to prevent directory traversal
 * @param path The file path to sanitize
 * @returns The sanitized path
 */
export function sanitizePath(path: string): string {
  return path.replace(/\.\./g, '').replace(/^(\/etc|\\\\|file:)/i, '');
}

/**
 * Checks if a file path is within allowed directories
 * @param path The path to check
 * @param allowedDirs Array of allowed directory paths
 * @returns true if path is allowed, false otherwise
 */
export function isPathAllowed(path: string, allowedDirs: string[]): boolean {
  const normalized = path.replace(/\\/g, '/');
  return allowedDirs.some(dir => normalized.startsWith(dir));
}

/**
 * Validates task titles for length and dangerous content
 * @param title The task title to validate
 * @returns true if title is valid, false otherwise
 */
export function validateTaskTitle(title: string): boolean {
  if (!title || title.length > 200) return false;
  if (title.match(/<script|javascript:|onerror|onload/i)) return false;
  return true;
}

/**
 * Validates configuration keys to prevent prototype pollution
 * @param key The configuration key to validate
 * @returns true if key is valid, false otherwise
 */
export function isValidConfigKey(key: string): boolean {
  const validKeys = ['backlogCliPath', 'transport', 'port', 'autoStart'];
  const blacklist = ['__proto__', 'constructor', 'prototype'];
  return validKeys.includes(key) && !blacklist.includes(key);
}

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param html The HTML content to sanitize
 * @returns The sanitized HTML
 */
export function sanitizeHTML(html: string): string {
  return html
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
}

/**
 * Rate limiter class to prevent rapid command execution
 */
export class RateLimiter {
  private requests: number[] = [];
  
  constructor(private limit: number, private window: number) {}
  
  allow(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter(t => t > now - this.window);
    
    if (this.requests.length < this.limit) {
      this.requests.push(now);
      return true;
    }
    return false;
  }
}

/**
 * Truncates output to prevent excessive memory usage
 * @param output The output to truncate
 * @param maxSize Maximum size in characters
 * @returns The truncated output
 */
export function truncateOutput(output: string, maxSize: number): string {
  if (output.length <= maxSize) return output;
  return output.slice(0, maxSize - 20) + '\n[Output truncated]';
}

/**
 * Semaphore class to limit concurrent operations
 */
export class Semaphore {
  private current = 0;
  private waiting: (() => void)[] = [];
  
  constructor(private max: number) {}
  
  async acquire(): Promise<void> {
    if (this.current < this.max) {
      this.current++;
      return;
    }
    
    return new Promise(resolve => {
      this.waiting.push(resolve);
    });
  }
  
  release(): void {
    this.current--;
    const next = this.waiting.shift();
    if (next) {
      this.current++;
      next();
    }
  }
}

/**
 * Checks if the current user has write permission to a path
 * @param path The path to check
 * @returns true if writable, false otherwise
 */
export function checkWritePermission(path: string): boolean {
  // Simplified check - in reality would use fs.access
  return !path.match(/^(\/etc|\/root|\/sys|\/proc)/);
}

/**
 * Checks if a command is allowed to be executed
 * @param cmd The command to check
 * @returns true if command is allowed, false otherwise
 */
export function isCommandAllowed(cmd: string): boolean {
  const forbidden = ['sudo', 'su', 'chmod', 'chown', 'rm -rf'];
  return !forbidden.some(f => cmd.includes(f));
}

/**
 * Sanitizes data for logging to prevent sensitive information leakage
 * @param data The data to sanitize for logging
 * @returns The sanitized data
 */
export function sanitizeForLogging(data: any): any {
  const sensitiveKeys = ['apiKey', 'password', 'token', 'secret', 'key'];
  const result = { ...data };
  
  for (const key of Object.keys(result)) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
      result[key] = '[REDACTED]';
    }
  }
  
  return result;
}

/**
 * Masks sensitive patterns in output text
 * @param output The output text to mask
 * @returns The output with sensitive patterns masked
 */
export function maskSensitiveOutput(output: string): string {
  return output
    .replace(/API_KEY=[\w-]+/g, 'API_KEY=[REDACTED]')
    .replace(/DATABASE_URL=[\w:/@.-]+/g, 'DATABASE_URL=[REDACTED]')
    .replace(/\b(sk-|ghp_|ghs_|pat_)[\w-]{20,}/g, '[REDACTED]');
}