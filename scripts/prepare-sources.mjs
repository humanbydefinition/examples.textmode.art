import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
const LIBRARIES_PATH = path.join(ROOT, 'libraries.json');
const SOURCE_ROOT = path.resolve(process.env.TEXTMODE_EXAMPLES_SOURCE_ROOT || path.join(ROOT, '.sources'));

const registry = JSON.parse(fs.readFileSync(LIBRARIES_PATH, 'utf8'));
const metadata = {
	schemaVersion: 1,
	libraries: [],
};

fs.mkdirSync(SOURCE_ROOT, { recursive: true });
fs.mkdirSync(PUBLIC, { recursive: true });

for (const lib of registry.libraries) {
	prepareLibrary(lib);
}

fs.writeFileSync(path.join(PUBLIC, 'source-metadata.json'), `${JSON.stringify(metadata, null, '\t')}\n`, 'utf8');
console.log(`\nWrote ${path.relative(ROOT, path.join(PUBLIC, 'source-metadata.json'))}`);

function prepareLibrary(lib) {
	const source = lib.source || {};
	const repository = source.repository;
	const ref = source.ref || 'main';

	if (!repository) {
		fail(`${lib.name}: missing source.repository in libraries.json`);
	}

	const repoDir = path.join(SOURCE_ROOT, lib.repo);

	console.log(`\n--- ${lib.name} ---`);
	console.log(`  source:  ${repository}@${ref}`);
	console.log(`  target:  ${path.relative(ROOT, repoDir)}`);

	fs.rmSync(repoDir, { recursive: true, force: true });
	run('git', ['clone', '--depth', '1', '--branch', ref, `https://github.com/${repository}.git`, repoDir], ROOT);

	const commit = run('git', ['rev-parse', 'HEAD'], repoDir).trim();
	console.log(`  commit:  ${commit}`);

	run('npm', ['ci'], repoDir, { HUSKY: '0' });
	run('npm', ['run', 'build'], repoDir, { HUSKY: '0' });

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

	metadata.libraries.push({
		name: lib.name,
		repository,
		ref,
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

function countSketches(dir) {
	let count = 0;
	const entries = fs.readdirSync(dir, { withFileTypes: true, recursive: true });
	for (const entry of entries) {
		if (entry.isFile() && entry.name === 'sketch.js') count++;
	}
	return count;
}

function fail(message) {
	console.error(message);
	process.exit(1);
}
