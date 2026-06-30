import fs from 'node:fs';
import path from 'node:path';
import { DIST, ROOT } from './lib/paths.mjs';
import { loadRegistry } from './lib/registry.mjs';

const appShell = path.join(DIST, 'index.html');
const registry = loadRegistry();

if (!fs.existsSync(appShell)) {
	throw new Error('dist/index.html is missing. Run vite build before postbuild.');
}

for (const library of registry.libraries) {
	const target = path.join(DIST, library.folder, 'index.html');
	fs.mkdirSync(path.dirname(target), { recursive: true });
	fs.copyFileSync(appShell, target);
}

const cname = path.join(ROOT, 'CNAME');
if (fs.existsSync(cname)) {
	fs.copyFileSync(cname, path.join(DIST, 'CNAME'));
}

console.log(`Prepared app shell for ${registry.libraries.length} library routes.`);
