import fs from 'node:fs';
import path from 'node:path';

export function readJson(filePath) {
	return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export function writeText(filePath, content) {
	fs.mkdirSync(path.dirname(filePath), { recursive: true });
	fs.writeFileSync(filePath, content, 'utf8');
}

export function removePath(filePath) {
	fs.rmSync(filePath, { recursive: true, force: true });
}

export function copyRecursive(src, dest) {
	if (!fs.existsSync(src)) return;
	fs.mkdirSync(dest, { recursive: true });
	const entries = fs.readdirSync(src, { withFileTypes: true });
	for (const entry of entries) {
		const srcPath = path.join(src, entry.name);
		const destPath = path.join(dest, entry.name);
		if (entry.isDirectory()) {
			copyRecursive(srcPath, destPath);
		} else {
			fs.copyFileSync(srcPath, destPath);
		}
	}
}

export function walkFiles(dir) {
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	return entries.flatMap((entry) => {
		const entryPath = path.join(dir, entry.name);
		return entry.isDirectory() ? walkFiles(entryPath) : [entryPath];
	});
}

export function countSketches(dir) {
	let count = 0;
	const entries = fs.readdirSync(dir, { withFileTypes: true, recursive: true });
	for (const entry of entries) {
		if (entry.isFile() && entry.name === 'sketch.js') count++;
	}
	return count;
}

export function countExamples(manifestPath) {
	if (!fs.existsSync(manifestPath)) return 0;
	const manifest = readJson(manifestPath);
	let count = 0;
	for (const group of manifest.groups || []) {
		if (Array.isArray(group.subgroups)) {
			for (const subgroup of group.subgroups) {
				count += (subgroup.examples || []).length;
			}
		} else {
			count += (group.examples || []).length;
		}
	}
	return count;
}
