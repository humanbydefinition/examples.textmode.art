import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildImportMap, hasConfiguredImport } from './lib/import-map.mjs';
import {
	copyRecursive,
	countExamples,
	countSketches,
	readJson,
	removePath,
	walkFiles,
	writeText,
} from './lib/files.mjs';
import { PUBLIC, DEFAULT_SOURCE_ROOT, VENDOR, projectPath } from './lib/paths.mjs';
import { loadRegistry, validateLibrary } from './lib/registry.mjs';

export function syncExamples({ sourceRoot = DEFAULT_SOURCE_ROOT, targetLib } = {}) {
	const registry = loadRegistry();
	const importMap = buildImportMap(registry.libraries);
	const failures = [];

	console.log('examples.textmode.art — sync');
	console.log('============================');
	console.log(`source root: ${projectPath(sourceRoot)}`);

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
		throw new Error('Sync failed:\n' + failures.map((f) => `  - ${f}`).join('\n'));
	}

	return results;

	function removeAppOwnedStaticFiles() {
		removePath(path.join(PUBLIC, 'index.html'));
		removePath(path.join(PUBLIC, 'scripts', 'library-gallery'));
		removePath(path.join(PUBLIC, 'styles'));
		console.log(`  assets:   removed legacy app-owned static files`);
	}

	function syncLibrary(lib) {
		console.log(`\n--- ${lib.name} ---`);
		validateSyncMetadata(lib);

		const repoSrc = path.join(sourceRoot, lib.repo);
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

		const manifestPath = path.join(examplesDest, 'manifest.json');
		const auxiliaryFileCount = enrichManifestExamples(manifestPath, examplesDest);
		if (auxiliaryFileCount > 0) console.log(`  metadata: ${auxiliaryFileCount} auxiliary files`);

		const exampleCount = countExamples(manifestPath);

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

	function enrichManifestExamples(manifestPath, examplesDest) {
		if (!fs.existsSync(manifestPath)) return 0;

		const manifest = readJson(manifestPath);
		let auxiliaryFileCount = 0;
		for (const example of getManifestExamples(manifest)) {
			const sketchRelativePath = getSketchRelativePath(example.sourceFile);
			if (!sketchRelativePath) continue;

			const exampleDir = path.dirname(path.join(examplesDest, sketchRelativePath));
			if (!fs.existsSync(exampleDir)) continue;

			const files = walkFiles(exampleDir)
				.filter((filePath) => path.basename(filePath) !== 'sketch.js')
				.map((filePath) => ({
					path: path.relative(exampleDir, filePath).split(path.sep).join('/'),
					type: getAuxiliaryFileType(filePath),
				}))
				.sort((a, b) => a.path.localeCompare(b.path));

			if (files.length > 0) {
				example.files = files;
				auxiliaryFileCount += files.length;
			} else {
				delete example.files;
			}
		}

		writeText(manifestPath, `${JSON.stringify(manifest, null, '\t')}\n`);
		return auxiliaryFileCount;
	}

	function getManifestExamples(manifest) {
		const examples = [];
		for (const group of manifest.groups || []) {
			if (Array.isArray(group.subgroups)) {
				for (const subgroup of group.subgroups) {
					examples.push(...(subgroup.examples || []));
				}
			} else {
				examples.push(...(group.examples || []));
			}
		}
		return examples;
	}

	function getSketchRelativePath(sourceFile) {
		if (
			typeof sourceFile !== 'string' ||
			!sourceFile.startsWith('examples/') ||
			!sourceFile.endsWith('/sketch.js')
		) {
			return null;
		}
		return sourceFile.slice('examples/'.length);
	}

	function getAuxiliaryFileType(filePath) {
		const extension = path.extname(filePath).toLowerCase();
		if (['.js', '.mjs'].includes(extension)) return 'module';
		if (['.frag', '.glsl', '.vert', '.fs', '.vs', '.txt'].includes(extension)) return 'text';
		return 'asset';
	}

	function reportProblem(message) {
		failures.push(message);
	}
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
	try {
		syncExamples({ targetLib: process.argv[2] });
	} catch (error) {
		console.error(error.message);
		process.exit(1);
	}
}
