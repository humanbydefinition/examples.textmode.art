import fs from 'node:fs';
import path from 'node:path';
import { buildImportMap, hasConfiguredImport } from './lib/import-map.mjs';
import { copyRecursive, countExamples, countSketches, removePath, writeText } from './lib/files.mjs';
import { PUBLIC, SOURCE_ROOT, VENDOR, projectPath } from './lib/paths.mjs';
import { loadRegistry, validateLibrary } from './lib/registry.mjs';

const STRICT = ['1', 'true'].includes((process.env.TEXTMODE_SYNC_STRICT || '').toLowerCase());
const registry = loadRegistry();
const importMap = buildImportMap(registry.libraries);
const failures = [];
const targetLib = process.argv[2];

console.log('examples.textmode.art — sync');
console.log('============================');
console.log(`source root: ${projectPath(SOURCE_ROOT)}`);
if (STRICT) console.log('strict mode: enabled');

removeAppOwnedStaticFiles();

const results = {};
for (const lib of registry.libraries) {
	if (targetLib && lib.name !== targetLib && lib.folder !== targetLib) continue;
	const result = syncLibrary(lib);
	if (result) results[lib.name] = result;
}

if (targetLib && Object.keys(results).length === 0) {
	reportProblem(`no library matched target "${targetLib}"`);
}

console.log('\n============================');
console.log('Sync complete.');
for (const [name, result] of Object.entries(results)) {
	console.log(
		`  ${name}: ${result.exampleCount} examples, ${result.sketchCount} sketches, vendor ${result.bundleCopied ? 'ok' : 'missing'}`
	);
}

if (failures.length > 0) {
	console.error('\nStrict sync failed:');
	for (const failure of failures) {
		console.error(`  - ${failure}`);
	}
	process.exit(1);
}

function removeAppOwnedStaticFiles() {
	removePath(path.join(PUBLIC, 'index.html'));
	removePath(path.join(PUBLIC, 'scripts', 'library-gallery'));
	removePath(path.join(PUBLIC, 'styles'));
	console.log(`  assets:   removed legacy app-owned static files`);
}

function syncLibrary(lib) {
	console.log(`\n--- ${lib.name} ---`);
	validateSyncMetadata(lib);

	const repoSrc = path.join(SOURCE_ROOT, lib.repo);
	const examplesSrc = path.join(repoSrc, 'examples');
	const examplesDest = path.join(PUBLIC, lib.folder);

	if (!fs.existsSync(examplesSrc)) {
		reportProblem(`${lib.name}: source not found at ${examplesSrc}`);
		return null;
	}

	removePath(examplesDest);
	copyRecursive(examplesSrc, examplesDest);
	removeSourceGalleryAssets(examplesDest);
	removePath(path.join(examplesDest, 'index.html'));

	const sketchCount = countSketches(examplesDest);
	console.log(`  examples: ${projectPath(examplesDest)} (${sketchCount} sketches)`);
	if (sketchCount === 0) {
		reportProblem(`${lib.name}: synced examples contain no sketch.js files`);
	}

	const bundleSrc = path.join(repoSrc, lib.bundle);
	const bundleDestDir = path.join(VENDOR, lib.name);
	const bundleDest = path.join(bundleDestDir, 'index.js');
	let bundleCopied = false;

	if (fs.existsSync(bundleSrc)) {
		fs.mkdirSync(bundleDestDir, { recursive: true });
		fs.copyFileSync(bundleSrc, bundleDest);
		bundleCopied = true;
		console.log(`  vendor:   ${projectPath(bundleDest)}`);
	} else {
		reportProblem(
			`${lib.name}: vendor bundle missing at ${bundleSrc} (run \`npm run build\` in ${lib.repo} first)`
		);
	}

	const sketchHtml = path.join(examplesDest, 'sketch.html');
	let importInjected = false;
	if (fs.existsSync(sketchHtml)) {
		importInjected = injectImportMap(sketchHtml);
		if (importInjected) console.log(`  importmap: injected into sketch.html`);
	}

	const exampleCount = countExamples(path.join(examplesDest, 'manifest.json'));

	return { sketchCount, exampleCount, importInjected, bundleCopied };
}

function validateSyncMetadata(lib) {
	for (const field of validateLibrary(lib)) {
		reportProblem(`${lib.name}: missing ${field} metadata in libraries.json`);
	}
}

function removeSourceGalleryAssets(examplesDest) {
	removePath(path.join(examplesDest, 'scripts', 'gallery'));
}

function injectImportMap(filePath) {
	let html = fs.readFileSync(filePath, 'utf8');
	const importMapPattern = /<script type="importmap">[\s\S]*?<\/script>/;
	const existingImportMap = html.match(importMapPattern)?.[0];

	if (existingImportMap) {
		if (!hasConfiguredImport(existingImportMap, registry.libraries)) {
			return false;
		}

		if (existingImportMap === importMap.trim()) {
			return false;
		}

		html = html.replace(importMapPattern, importMap.trim());
		writeText(filePath, html);
		return true;
	}

	html = html.replace('</head>', `\t${importMap}</head>`);
	writeText(filePath, html);
	return true;
}

function reportProblem(message) {
	if (STRICT) {
		failures.push(message);
	} else {
		console.warn(`  ${message}`);
	}
}
