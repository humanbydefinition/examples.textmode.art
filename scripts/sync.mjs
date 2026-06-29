import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PARENT = path.resolve(ROOT, '..');
const PUBLIC = path.join(ROOT, 'public');
const VENDOR = path.join(PUBLIC, 'vendor');
const LIBRARIES_PATH = path.join(ROOT, 'libraries.json');
const PORTAL_CSS_HREF = './styles/portal.css?v=portal-2';

const IMPORT_MAP = `<script type="importmap">
{
  "imports": {
    "textmode.js": "/vendor/textmode.js/index.js",
    "textmode.filters.js": "/vendor/textmode.filters.js/index.js",
    "textmode.synth.js": "/vendor/textmode.synth.js/index.js",
    "textmode.export.js": "/vendor/textmode.export.js/index.js",
    "textmode.figlet.js": "/vendor/textmode.figlet.js/index.js"
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
`;

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
	if (html.includes('<script type="importmap">')) {
		return false;
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

function writePortalStyles(examplesDest) {
	const stylesDir = path.join(examplesDest, 'styles');
	if (!fs.existsSync(stylesDir)) return false;

	const stylePath = path.join(stylesDir, 'portal.css');
	fs.writeFileSync(stylePath, PORTAL_STYLES, 'utf8');
	return true;
}

function syncLibrary(lib) {
	console.log(`\n--- ${lib.name} ---`);

	const examplesSrc = path.join(PARENT, lib.repo, 'examples');
	const examplesDest = path.join(PUBLIC, lib.folder);

	if (!fs.existsSync(examplesSrc)) {
		console.warn(`  SKIP: source not found at ${examplesSrc}`);
		return null;
	}

	fs.rmSync(examplesDest, { recursive: true, force: true });
	cpRecursive(examplesSrc, examplesDest);
	const sketchCount = countSketches(examplesDest);
	console.log(`  examples: ${PATH(examplesDest)} (${sketchCount} sketches)`);

	const bundleSrc = path.join(PARENT, lib.repo, lib.bundle);
	const bundleDestDir = path.join(VENDOR, lib.name);
	const bundleDest = path.join(bundleDestDir, 'index.js');

	if (fs.existsSync(bundleSrc)) {
		fs.mkdirSync(bundleDestDir, { recursive: true });
		fs.copyFileSync(bundleSrc, bundleDest);
		console.log(`  vendor:   ${PATH(bundleDest)}`);
	} else {
		console.warn(`  vendor:   MISSING — ${bundleSrc} not found (run \`npm run build\` in ${lib.repo} first)`);
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
		if (portalStylesWritten || portalHeaderInjected) console.log(`  portal:   linked back to landing index`);
	}

	return { sketchCount, exampleCount, importInjected };
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

// Copy libraries.json into public/ so the landing page can fetch it
fs.copyFileSync(LIBRARIES_PATH, path.join(PUBLIC, 'libraries.json'));
console.log(`  config:   copied libraries.json → public/`);

const registry = JSON.parse(fs.readFileSync(LIBRARIES_PATH, 'utf8'));
const targetLib = process.argv[2];

console.log('examples.textmode.art — sync');
console.log('============================');

const results = {};
for (const lib of registry.libraries) {
	if (targetLib && lib.name !== targetLib && lib.folder !== targetLib) continue;
	const result = syncLibrary(lib);
	if (result) results[lib.name] = result;
}

console.log('\n============================');
console.log('Sync complete.');
for (const [name, result] of Object.entries(results)) {
	console.log(`  ${name}: ${result.exampleCount} examples, ${result.sketchCount} sketches, vendor ${result.importInjected ? 'ok' : 'skipped'}`);
}
