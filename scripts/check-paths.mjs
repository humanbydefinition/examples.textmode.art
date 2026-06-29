import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
const expectedVendorPrefix = '../vendor/';

function walk(dir) {
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	return entries.flatMap((entry) => {
		const entryPath = path.join(dir, entry.name);
		return entry.isDirectory() ? walk(entryPath) : [entryPath];
	});
}

const sketchHtmlFiles = walk(PUBLIC).filter((filePath) => filePath.endsWith('/sketch.html'));
const failures = [];

for (const filePath of sketchHtmlFiles) {
	const html = fs.readFileSync(filePath, 'utf8');
	const relativePath = path.relative(ROOT, filePath);

	if (html.includes('"/vendor/')) {
		failures.push(`${relativePath}: import map must not use root-absolute /vendor paths.`);
	}

	if (!html.includes(`"textmode.js": "${expectedVendorPrefix}textmode.js/index.js"`)) {
		failures.push(`${relativePath}: import map must use ${expectedVendorPrefix} vendor paths.`);
	}
}

if (failures.length > 0) {
	console.error(failures.join('\n'));
	process.exit(1);
}

console.log(`Checked ${sketchHtmlFiles.length} sketch import maps.`);
