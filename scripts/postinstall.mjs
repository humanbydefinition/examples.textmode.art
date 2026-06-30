import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

console.log('postinstall: syncing upstream examples and vendor bundles...');

const result = spawnSync(process.execPath, ['scripts/sync-latest.mjs'], {
	cwd: ROOT,
	stdio: 'inherit',
});

if (result.status !== 0) {
	console.warn('\npostinstall: sync did not complete successfully.');
	console.warn('  Run `npm run sync` manually to retry.');
	process.exit(0);
}
