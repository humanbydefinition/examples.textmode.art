import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_ROOT = path.resolve(process.env.TEXTMODE_EXAMPLES_SOURCE_ROOT || path.join(ROOT, '.sources'));
const STRICT = ['1', 'true'].includes((process.env.TEXTMODE_SYNC_STRICT || '').toLowerCase());
const PUBLIC = path.join(ROOT, 'public');
const VENDOR = path.join(PUBLIC, 'vendor');
const LIBRARIES_PATH = path.join(ROOT, 'libraries.json');
const DEFAULT_DOCS_URL = 'https://code.textmode.art';
const IMPRINT_URL = 'https://legal.textmode.art/projects/examples.textmode.art/en/imprint';
const PRIVACY_URL = 'https://legal.textmode.art/projects/examples.textmode.art/en/privacy';

const IMPORT_MAP_PATH_PREFIX = '../vendor';
const IMPORT_MAP = `<script type="importmap">
{
  "imports": {
    "textmode.js": "${IMPORT_MAP_PATH_PREFIX}/textmode.js/index.js",
    "textmode.filters.js": "${IMPORT_MAP_PATH_PREFIX}/textmode.filters.js/index.js",
    "textmode.synth.js": "${IMPORT_MAP_PATH_PREFIX}/textmode.synth.js/index.js",
    "textmode.export.js": "${IMPORT_MAP_PATH_PREFIX}/textmode.export.js/index.js",
    "textmode.figlet.js": "${IMPORT_MAP_PATH_PREFIX}/textmode.figlet.js/index.js"
  }
}
</script>
`;

const failures = [];

function cpRecursive(src, dest) {
	if (!fs.existsSync(src)) return;
	fs.mkdirSync(dest, { recursive: true });
	const entries = fs.readdirSync(src, { withFileTypes: true });
	for (const entry of entries) {
		const srcPath = path.join(src, entry.name);
		const destPath = path.join(dest, entry.name);
		if (entry.isDirectory()) {
			cpRecursive(srcPath, destPath);
		} else {
			fs.copyFileSync(srcPath, destPath);
		}
	}
}

function injectImportMap(filePath) {
	let html = fs.readFileSync(filePath, 'utf8');
	const importMapPattern = /<script type="importmap">[\s\S]*?<\/script>/;
	const existingImportMap = html.match(importMapPattern)?.[0];

	if (existingImportMap) {
		if (!existingImportMap.includes('"textmode.js"')) {
			return false;
		}

		if (existingImportMap === IMPORT_MAP.trim()) {
			return false;
		}

		html = html.replace(importMapPattern, IMPORT_MAP.trim());
		fs.writeFileSync(filePath, html, 'utf8');
		return true;
	}

	html = html.replace('</head>', `\t${IMPORT_MAP}</head>`);
	fs.writeFileSync(filePath, html, 'utf8');
	return true;
}

function syncLibrary(lib) {
	console.log(`\n--- ${lib.name} ---`);

	const repoSrc = path.join(SOURCE_ROOT, lib.repo);
	const examplesSrc = path.join(repoSrc, 'examples');
	const examplesDest = path.join(PUBLIC, lib.folder);

	if (!fs.existsSync(examplesSrc)) {
		reportProblem(`${lib.name}: source not found at ${examplesSrc}`);
		return null;
	}

	fs.rmSync(examplesDest, { recursive: true, force: true });
	cpRecursive(examplesSrc, examplesDest);
	const sketchCount = countSketches(examplesDest);
	console.log(`  examples: ${PATH(examplesDest)} (${sketchCount} sketches)`);
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
		console.log(`  vendor:   ${PATH(bundleDest)}`);
	} else {
		reportProblem(`${lib.name}: vendor bundle missing at ${bundleSrc} (run \`npm run build\` in ${lib.repo} first)`);
	}

	const sketchHtml = path.join(examplesDest, 'sketch.html');
	let importInjected = false;
	if (fs.existsSync(sketchHtml)) {
		importInjected = injectImportMap(sketchHtml);
		if (importInjected) console.log(`  importmap: injected into sketch.html`);
	}

	const exampleCount = countExamples(path.join(examplesDest, 'manifest.json'));
	const indexHtml = path.join(examplesDest, 'index.html');
	writeLibraryIndex(indexHtml, lib);
	console.log(`  index:    generated shared gallery page`);

	return { sketchCount, exampleCount, importInjected, bundleCopied };
}

function writeLibraryIndex(filePath, lib) {
	if (!lib.license) {
		reportProblem(`${lib.name}: missing license metadata in libraries.json`);
	}

	const docsUrl = lib.docsUrl || DEFAULT_DOCS_URL;
	const licenseText = lib.license ? `${lib.name} - ${lib.license} license` : `${lib.name} examples`;
	const html = `<!doctype html>
<html lang="en">
\t<head>
\t\t<meta charset="utf-8" />
\t\t<title>${escapeHtml(lib.name)} - examples</title>
\t\t<meta name="viewport" content="width=device-width, initial-scale=1.0" />
\t\t<link rel="preconnect" href="https://fonts.googleapis.com" />
\t\t<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
\t\t<link
\t\t\thref="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap"
\t\t\trel="stylesheet"
\t\t/>
\t\t<link rel="stylesheet" href="../styles/library-index.css" />
\t</head>

\t<body>
\t\t<div class="examples-page">
\t\t\t<header class="examples-header">
\t\t\t\t<nav class="examples-breadcrumb" aria-label="Breadcrumb">
\t\t\t\t\t<a href="../" aria-label="Back to all example libraries">
\t\t\t\t\t\t<span aria-hidden="true">&larr;</span>
\t\t\t\t\t\t<span>all libraries</span>
\t\t\t\t\t</a>
\t\t\t\t</nav>
\t\t\t\t<div class="examples-header-primary">
\t\t\t\t\t<div class="examples-brand">
\t\t\t\t\t\t<h1>${escapeHtml(lib.name)}</h1>
\t\t\t\t\t\t<p>${escapeHtml(lib.tagline || lib.description || '')}</p>
\t\t\t\t\t</div>
\t\t\t\t\t<label class="examples-search" for="search">
\t\t\t\t\t\t<span class="examples-search-icon" aria-hidden="true">/</span>
\t\t\t\t\t\t<input
\t\t\t\t\t\t\tid="search"
\t\t\t\t\t\t\ttype="text"
\t\t\t\t\t\t\tplaceholder="filter examples..."
\t\t\t\t\t\t\tautocomplete="off"
\t\t\t\t\t\t\tspellcheck="false"
\t\t\t\t\t\t/>
\t\t\t\t\t</label>
\t\t\t\t</div>
\t\t\t</header>

\t\t\t<main id="examples" class="examples-browser" data-manifest="./manifest.json"></main>

\t\t\t<footer class="examples-footer">
\t\t\t\t<p>${escapeHtml(licenseText)}</p>
\t\t\t\t<nav class="examples-footer-links" aria-label="Project links">
\t\t\t\t\t<a href="https://github.com/humanbydefinition" target="_blank" rel="noopener noreferrer"
\t\t\t\t\t\t><span class="footer-link-label footer-link-label-desktop">@humanbydefinition</span
\t\t\t\t\t\t><span class="footer-link-label footer-link-label-mobile">@hbd</span></a
\t\t\t\t\t>
\t\t\t\t\t<a
\t\t\t\t\t\thref="https://github.com/${escapeHtml(lib.github)}"
\t\t\t\t\t\ttarget="_blank"
\t\t\t\t\t\trel="noopener noreferrer"
\t\t\t\t\t\t>github</a
\t\t\t\t\t>
\t\t\t\t\t<a href="${escapeHtml(docsUrl)}" target="_blank" rel="noopener noreferrer">docs</a>
\t\t\t\t\t<a href="${IMPRINT_URL}">imprint</a>
\t\t\t\t\t<a href="${PRIVACY_URL}">privacy</a>
\t\t\t\t</nav>
\t\t\t</footer>
\t\t</div>

\t\t<script type="module" src="../scripts/library-gallery/main.js"></script>
\t</body>
</html>
`;

	fs.writeFileSync(filePath, html, 'utf8');
}

function countSketches(dir) {
	let count = 0;
	const entries = fs.readdirSync(dir, { withFileTypes: true, recursive: true });
	for (const entry of entries) {
		if (entry.isFile() && entry.name === 'sketch.js') count++;
	}
	return count;
}

function countExamples(manifestPath) {
	if (!fs.existsSync(manifestPath)) return 0;
	const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
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

function PATH(abs) {
	return path.relative(ROOT, abs);
}

function escapeHtml(value) {
	return String(value).replace(/[&<>"']/g, (char) => {
		return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
	});
}

function reportProblem(message) {
	if (STRICT) {
		failures.push(message);
	} else {
		console.warn(`  ${message}`);
	}
}

// Copy libraries.json into public/ so the landing page can fetch it
fs.copyFileSync(LIBRARIES_PATH, path.join(PUBLIC, 'libraries.json'));
console.log(`  config:   copied libraries.json → public/`);

const registry = JSON.parse(fs.readFileSync(LIBRARIES_PATH, 'utf8'));
const targetLib = process.argv[2];

console.log('examples.textmode.art — sync');
console.log('============================');
console.log(`source root: ${PATH(SOURCE_ROOT)}`);
if (STRICT) console.log('strict mode: enabled');

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
	console.log(`  ${name}: ${result.exampleCount} examples, ${result.sketchCount} sketches, vendor ${result.bundleCopied ? 'ok' : 'missing'}`);
}

if (failures.length > 0) {
	console.error('\nStrict sync failed:');
	for (const failure of failures) {
		console.error(`  - ${failure}`);
	}
	process.exit(1);
}
