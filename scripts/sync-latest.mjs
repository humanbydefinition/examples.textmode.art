import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const sourceRoot = '.sources';

run(process.execPath, ['scripts/prepare-sources.mjs', ...args], {});
run(process.execPath, ['scripts/sync.mjs', ...args], {
	TEXTMODE_EXAMPLES_SOURCE_ROOT: sourceRoot,
	TEXTMODE_SYNC_STRICT: '1',
});

function run(command, args, extraEnv) {
	const result = spawnSync(command, args, {
		cwd: ROOT,
		env: { ...process.env, ...extraEnv },
		stdio: 'inherit',
	});

	if (result.status !== 0) {
		process.exit(result.status ?? 1);
	}
}
