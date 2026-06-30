import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { countSketches, readJson, writeText } from './lib/files.mjs';
import { PUBLIC, ROOT, SOURCE_METADATA_PATH, SOURCE_ROOT, projectPath } from './lib/paths.mjs';
import { loadRegistry } from './lib/registry.mjs';

const targetLib = process.argv[2];
const registry = loadRegistry();
const metadata =
	targetLib && fs.existsSync(SOURCE_METADATA_PATH)
		? readJson(SOURCE_METADATA_PATH)
		: {
				schemaVersion: 1,
				libraries: [],
			};
const prepared = new Map(metadata.libraries.map((entry) => [entry.name, entry]));
const libraries = registry.libraries.filter((lib) => !targetLib || lib.name === targetLib || lib.folder === targetLib);

if (targetLib && libraries.length === 0) {
	fail(`No library matched target "${targetLib}".`);
}

fs.mkdirSync(SOURCE_ROOT, { recursive: true });
fs.mkdirSync(PUBLIC, { recursive: true });

for (const lib of libraries) {
	prepareLibrary(lib);
}

metadata.libraries = registry.libraries.filter((lib) => prepared.has(lib.name)).map((lib) => prepared.get(lib.name));

writeText(SOURCE_METADATA_PATH, `${JSON.stringify(metadata, null, '\t')}\n`);
console.log(`\nWrote ${projectPath(SOURCE_METADATA_PATH)}`);

function prepareLibrary(lib) {
	const source = lib.source || {};
	const repository = source.repository;
	const ref = source.ref || 'main';
	const prepareMode = source.prepare || 'build';

	if (!repository) {
		fail(`${lib.name}: missing source.repository in libraries.json`);
	}
	if (!['build', 'prebuilt'].includes(prepareMode)) {
		fail(`${lib.name}: unsupported source.prepare value "${prepareMode}"`);
	}

	const repoDir = path.join(SOURCE_ROOT, lib.repo);

	console.log(`\n--- ${lib.name} ---`);
	console.log(`  source:  ${repository}@${ref}`);
	console.log(`  target:  ${projectPath(repoDir)}`);

	fs.rmSync(repoDir, { recursive: true, force: true });
	run('git', ['clone', '--depth', '1', '--branch', ref, `https://github.com/${repository}.git`, repoDir], ROOT);

	const commit = run('git', ['rev-parse', 'HEAD'], repoDir).trim();
	console.log(`  commit:  ${commit}`);
	console.log(`  prepare: ${prepareMode}`);

	if (prepareMode === 'build') {
		run('npm', ['ci'], repoDir, { HUSKY: '0' });
		run('npm', ['run', 'build'], repoDir, { HUSKY: '0' });
	}

	const examplesDir = path.join(repoDir, 'examples');
	const bundlePath = path.join(repoDir, lib.bundle);

	if (!fs.existsSync(examplesDir)) {
		fail(`${lib.name}: missing examples directory at ${examplesDir}`);
	}

	const sketchCount = countSketches(examplesDir);
	if (sketchCount === 0) {
		fail(`${lib.name}: source examples directory contains no sketch.js files`);
	}

	if (!fs.existsSync(bundlePath)) {
		fail(`${lib.name}: expected bundle missing at ${bundlePath}`);
	}

	prepared.set(lib.name, {
		name: lib.name,
		repository,
		ref,
		prepare: prepareMode,
		commit,
		examples: path.posix.join(lib.repo, 'examples'),
		bundle: path.posix.join(lib.repo, lib.bundle.replaceAll(path.sep, '/')),
		sketchCount,
	});
}

function run(command, args, cwd, extraEnv = {}) {
	const result = spawnSync(command, args, {
		cwd,
		env: { ...process.env, ...extraEnv },
		encoding: 'utf8',
		stdio: ['ignore', 'pipe', 'pipe'],
	});

	if (result.stdout) process.stdout.write(result.stdout);
	if (result.stderr) process.stderr.write(result.stderr);

	if (result.status !== 0) {
		fail(`${command} ${args.join(' ')} failed in ${cwd}`);
	}

	return result.stdout;
}

function fail(message) {
	console.error(message);
	process.exit(1);
}
