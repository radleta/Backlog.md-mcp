#!/usr/bin/env node

/**
 * Copy necessary files after TypeScript compilation
 * This ensures package.json and other files are in the right place for the dist
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Files to copy from source to package after build
const filesToCopy = [
	// Any additional files that need to be in dist can be added here
];

// Ensure dist directory exists
const distDir = path.join(__dirname, '../dist');
if (!fs.existsSync(distDir)) {
	fs.mkdirSync(distDir, { recursive: true });
}

// Copy files
filesToCopy.forEach(file => {
	const source = path.join(__dirname, '..', file);
	const dest = path.join(distDir, path.basename(file));
	
	if (fs.existsSync(source)) {
		fs.copyFileSync(source, dest);
		console.log(`Copied ${file} to dist/`);
	}
});

console.log('Build files copied successfully');