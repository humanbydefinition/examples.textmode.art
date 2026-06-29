import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_ROOT = path.resolve(process.env.TEXTMODE_EXAMPLES_SOURCE_ROOT || path.join(ROOT, '.sources'));
const STRICT = ['1', 'true'].includes((process.env.TEXTMODE_SYNC_STRICT || '').toLowerCase());
const PUBLIC = path.join(ROOT, 'public');
const VENDOR = path.join(PUBLIC, 'vendor');
const LIBRARIES_PATH = path.join(ROOT, 'libraries.json');
const PORTAL_CSS_HREF = './styles/portal.css?v=portal-2';
const LEGAL_FOOTER_LINKS = `\t\t\t\t\t<a href="https://legal.textmode.art/projects/examples.textmode.art/en/imprint">imprint</a>
\t\t\t\t\t<a href="https://legal.textmode.art/projects/examples.textmode.art/en/privacy">privacy</a>`;

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

const PORTAL_STYLES = `.examples-breadcrumb {
\tdisplay: flex;
\talign-items: center;
\tmin-width: 0;
\tmargin-bottom: 0.25rem;
\tpadding-bottom: 0.75rem;
\tborder-bottom: 1px solid var(--border-color);
\tfont-size: 0.72rem;
\tline-height: 1.4;
}

.examples-breadcrumb a {
\tdisplay: inline-flex;
\talign-items: center;
\tjustify-content: center;
\tgap: 0.5rem;
\tmax-width: 100%;
\tmin-height: 2rem;
\tpadding: 0 0.7rem;
\tborder: 1px solid var(--border-color);
\tborder-radius: 0.375rem;
\tbackground: var(--panel-color);
\tcolor: var(--text-secondary);
\tfont-weight: 500;
\ttext-decoration: none;
\ttransition:
\t\tbackground-color 0.15s,
\t\tcolor 0.15s,
\t\tborder-color 0.15s;
}

.examples-breadcrumb a:hover {
\tborder-color: var(--border-strong-color);
\tbackground: var(--panel-strong-color);
\tcolor: var(--text-primary);
}

.examples-breadcrumb a:focus-visible {
\tborder-color: var(--border-strong-color);
\tbackground: var(--panel-strong-color);
\tcolor: var(--text-primary);
\toutline: 1px solid var(--border-strong-color);
\toutline-offset: 0.25rem;
}

@media (max-width: 640px) {
\t.examples-breadcrumb {
\t\tpadding-bottom: 0.625rem;
\t}

\t.examples-breadcrumb a {
\t\tmin-height: 2.25rem;
\t\tpadding: 0 0.75rem;
\t}
}

.examples-footer-links {
\tflex-wrap: wrap;
}

@media (max-width: 640px) {
\t.examples-footer-links {
\t\twhite-space: normal;
\t}
}
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

function injectPortalHeader(filePath) {
	let html = fs.readFileSync(filePath, 'utf8');
	let changed = false;

	const portalLinkPattern = /<link rel="stylesheet" href="\.\/styles\/portal\.css(?:\?[^"]*)?" \/>/;
	const portalLink = `<link rel="stylesheet" href="${PORTAL_CSS_HREF}" />`;
	if (portalLinkPattern.test(html)) {
		const nextHtml = html.replace(portalLinkPattern, portalLink);
		if (nextHtml !== html) {
			html = nextHtml;
			changed = true;
		}
	} else {
		html = html.replace(
			'<link rel="stylesheet" href="./styles/index.css" />',
			`<link rel="stylesheet" href="./styles/index.css" />\n\t\t${portalLink}`,
		);
		changed = true;
	}

	if (!html.includes('class="examples-breadcrumb"')) {
		html = html.replace(
			'<header class="examples-header">\n\t\t\t\t<div class="examples-header-primary">',
			`<header class="examples-header">
\t\t\t\t<nav class="examples-breadcrumb" aria-label="Breadcrumb">
\t\t\t\t\t<a href="../" aria-label="Back to all example libraries">
\t\t\t\t\t\t<span aria-hidden="true">&larr;</span>
\t\t\t\t\t\t<span>all libraries</span>
\t\t\t\t\t</a>
\t\t\t\t</nav>
\t\t\t\t<div class="examples-header-primary">`,
		);
		changed = true;
	}

	if (changed) fs.writeFileSync(filePath, html, 'utf8');
	return changed;
}

function injectLegalFooterLinks(filePath) {
	let html = fs.readFileSync(filePath, 'utf8');
	if (html.includes('https://legal.textmode.art/projects/examples.textmode.art/en/imprint')) {
		return false;
	}

	html = html.replace(
		'\n\t\t\t\t</nav>\n\t\t\t</footer>',
		`\n${LEGAL_FOOTER_LINKS}\n\t\t\t\t</nav>\n\t\t\t</footer>`,
	);
	fs.writeFileSync(filePath, html, 'utf8');
	return true;
}

function writePortalStyles(examplesDest) {
	const stylesDir = path.join(examplesDest, 'styles');
	if (!fs.existsSync(stylesDir)) return false;

	const stylePath = path.join(stylesDir, 'portal.css');
	fs.writeFileSync(stylePath, PORTAL_STYLES, 'utf8');
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
	if (fs.existsSync(indexHtml)) {
		const portalStylesWritten = writePortalStyles(examplesDest);
		const portalHeaderInjected = injectPortalHeader(indexHtml);
		const legalFooterInjected = injectLegalFooterLinks(indexHtml);
		if (portalStylesWritten || portalHeaderInjected) console.log(`  portal:   linked back to landing index`);
		if (legalFooterInjected) console.log(`  legal:    footer links injected`);
	}

	return { sketchCount, exampleCount, importInjected, bundleCopied };
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
