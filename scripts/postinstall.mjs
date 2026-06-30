import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

if (process.env.CI) {
	console.log('postinstall: CI detected, skipping auto-sync (CI runs `npm run sync:ci` explicitly).');
	process.exit(0);
}

const skipEnv = (process.env.TEXTMODE_SKIP_POSTINSTALL_SYNC || '').toLowerCase();
if (skipEnv === '1' || skipEnv === 'true') {
	console.log('postinstall: TEXTMODE_SKIP_POSTINSTALL_SYNC is set, skipping auto-sync.');
	process.exit(0);
}

console.log('postinstall: syncing upstream examples and vendor bundles...');
console.log('  (run `npm run sync` to re-sync; set TEXTMODE_SKIP_POSTINSTALL_SYNC=1 to skip)\n');

const result = spawnSync(process.execPath, ['scripts/sync-latest.mjs'], {
	cwd: ROOT,
	stdio: 'inherit',
});

if (result.status !== 0) {
	console.warn('\npostinstall: `npm run sync` did not complete successfully.');
	console.warn('  Examples may be unavailable until you run `npm run sync` manually.');
	console.warn('  To skip future auto-syncs, set TEXTMODE_SKIP_POSTINSTALL_SYNC=1.');
	process.exit(0);
}
