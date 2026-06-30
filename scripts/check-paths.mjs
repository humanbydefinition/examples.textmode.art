import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
const LIBRARIES_PATH = path.join(ROOT, 'libraries.json');
const expectedVendorPrefix = '../vendor/';
const registry = JSON.parse(fs.readFileSync(LIBRARIES_PATH, 'utf8'));

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

for (const lib of registry.libraries || []) {
	const indexPath = path.join(PUBLIC, lib.folder, 'index.html');
	const relativePath = path.relative(ROOT, indexPath);

	if (!fs.existsSync(indexPath)) {
		failures.push(`${relativePath}: generated library index is missing.`);
		continue;
	}

	const html = fs.readFileSync(indexPath, 'utf8');

	if (!html.includes('href="../styles/library-index.css"')) {
		failures.push(`${relativePath}: must use shared ../styles/library-index.css.`);
	}

	if (!html.includes('src="../scripts/library-gallery/main.js"')) {
		failures.push(`${relativePath}: must use shared ../scripts/library-gallery/main.js.`);
	}

	if (html.includes('cdn.tailwindcss.com')) {
		failures.push(`${relativePath}: must not load Tailwind from a source repository index.`);
	}

	if (html.includes('href="./style.css"') || html.includes('href="./styles/index.css"')) {
		failures.push(`${relativePath}: must not reference source-local index styles.`);
	}

	if (html.includes('src="./scripts/gallery/main.js"')) {
		failures.push(`${relativePath}: must not reference source-local gallery scripts.`);
	}
}

if (failures.length > 0) {
	console.error(failures.join('\n'));
	process.exit(1);
}

console.log(`Checked ${sketchHtmlFiles.length} sketch import maps and ${registry.libraries.length} library indexes.`);
