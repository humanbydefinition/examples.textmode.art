import fs from 'node:fs';
import path from 'node:path';
import { parseImportMap } from './lib/import-map.mjs';
import { readJson, walkFiles } from './lib/files.mjs';
import { PUBLIC, SOURCE_METADATA_PATH, SRC_PUBLIC_ASSETS, projectPath } from './lib/paths.mjs';
import { IMPRINT_URL, LANDING_PAGE_VERSION, PRIVACY_URL, loadRegistry } from './lib/registry.mjs';

const expectedVendorPrefix = '../vendor/';
const registry = loadRegistry();
const failures = [];
const expectedImports = Object.fromEntries(
	registry.libraries.map((lib) => [lib.name, `${expectedVendorPrefix}${lib.name}/index.js`])
);

validateGeneratedAssets();
validateLandingPage();
validateSketchImportMaps();
validateLibraryOutputs();
validateSourceMetadata();

if (failures.length > 0) {
	console.error(failures.join('\n'));
	process.exit(1);
}

console.log(
	`Checked ${registry.libraries.length} libraries, ${getSketchHtmlFiles().length} sketch import maps, and generated assets.`
);

function validateGeneratedAssets() {
	if (fs.existsSync(path.join(PUBLIC, 'libraries.json'))) {
		failures.push(
			'public/libraries.json must not exist; use the root libraries.json registry as the source of truth.'
		);
	}

	if (fs.existsSync(path.join(PUBLIC, 'styles', 'library-index', 'tokens.css'))) {
		failures.push(
			'public/styles/library-index/tokens.css must not exist; library pages must use the shared public/styles/tokens.css.'
		);
	}

	for (const srcFile of walkFiles(SRC_PUBLIC_ASSETS)) {
		const relative = path.relative(SRC_PUBLIC_ASSETS, srcFile);
		const publicFile = path.join(PUBLIC, relative);
		if (!fs.existsSync(publicFile)) {
			failures.push(`${projectPath(publicFile)}: first-party asset is missing from public output.`);
			continue;
		}
		if (fs.readFileSync(srcFile, 'utf8') !== fs.readFileSync(publicFile, 'utf8')) {
			failures.push(`${projectPath(publicFile)}: first-party asset differs from src/public-assets.`);
		}
	}
}

function validateLandingPage() {
	const indexPath = path.join(PUBLIC, 'index.html');
	if (!fs.existsSync(indexPath)) {
		failures.push('public/index.html: landing page is missing.');
		return;
	}

	const html = fs.readFileSync(indexPath, 'utf8');
	if (!html.includes('<main id="libraries" class="landing-grid">')) {
		failures.push('public/index.html: generated landing grid is missing.');
	}
	if (html.includes('scripts/landing/main.js') || html.includes('./libraries.json')) {
		failures.push('public/index.html: landing page must not depend on the removed runtime registry fetch.');
	}
	for (const lib of registry.libraries) {
		if (!html.includes(`href="./${lib.folder}/?v=${LANDING_PAGE_VERSION}"`)) {
			failures.push(`public/index.html: missing landing card link for ${lib.name}.`);
		}
	}
}

function validateSketchImportMaps() {
	for (const filePath of getSketchHtmlFiles()) {
		const html = fs.readFileSync(filePath, 'utf8');
		const relativePath = projectPath(filePath);

		if (html.includes('"/vendor/')) {
			failures.push(`${relativePath}: import map must not use root-absolute /vendor paths.`);
		}

		const importMap = parseSketchImportMap(html, relativePath);
		if (!importMap) continue;

		for (const [name, expectedPath] of Object.entries(expectedImports)) {
			if (importMap.imports?.[name] !== expectedPath) {
				failures.push(`${relativePath}: import map must map "${name}" to "${expectedPath}".`);
			}
		}
	}
}

function validateLibraryOutputs() {
	for (const lib of registry.libraries) {
		const libDir = path.join(PUBLIC, lib.folder);
		const indexPath = path.join(libDir, 'index.html');
		const manifestPath = path.join(libDir, 'manifest.json');
		const sketchPath = path.join(libDir, 'sketch.html');
		const vendorPath = path.join(PUBLIC, 'vendor', lib.name, 'index.js');

		if (!fs.existsSync(indexPath)) {
			failures.push(`${projectPath(indexPath)}: generated library index is missing.`);
			continue;
		}
		if (!fs.existsSync(manifestPath)) failures.push(`${projectPath(manifestPath)}: manifest is missing.`);
		if (!fs.existsSync(sketchPath)) failures.push(`${projectPath(sketchPath)}: sketch runner is missing.`);
		if (!fs.existsSync(vendorPath)) failures.push(`${projectPath(vendorPath)}: vendor bundle is missing.`);
		if (fs.existsSync(path.join(libDir, 'scripts', 'gallery'))) {
			failures.push(
				`${projectPath(path.join(libDir, 'scripts', 'gallery'))}: stale source-local gallery runtime must not be synced.`
			);
		}

		const html = fs.readFileSync(indexPath, 'utf8');
		validateLibraryIndexHtml(lib, html, projectPath(indexPath));
	}
}

function validateLibraryIndexHtml(lib, html, relativePath) {
	if (!html.includes('href="../styles/library-index.css"')) {
		failures.push(`${relativePath}: must use shared ../styles/library-index.css.`);
	}
	if (!html.includes('src="../scripts/library-gallery/main.js"')) {
		failures.push(`${relativePath}: must use shared ../scripts/library-gallery/main.js.`);
	}
	if (!html.includes('aria-label="Filter examples"')) {
		failures.push(`${relativePath}: search input must have an explicit aria-label.`);
	}
	if (!html.includes(`href="https://github.com/${lib.github}"`)) {
		failures.push(`${relativePath}: missing configured GitHub link for ${lib.name}.`);
	}
	if (!html.includes(`href="${lib.docsUrl}"`)) {
		failures.push(`${relativePath}: missing configured docs link for ${lib.name}.`);
	}
	if (!html.includes(`href="${IMPRINT_URL}"`) || !html.includes(`href="${PRIVACY_URL}"`)) {
		failures.push(`${relativePath}: missing legal footer links.`);
	}
	if (html.includes('cdn.tailwindcss.com')) {
		failures.push(`${relativePath}: must not load Tailwind from a source repository index.`);
	}
	if (html.includes('href="./style.css"') || html.includes('href="./styles/index.css"')) {
		failures.push(`${relativePath}: must not reference source-local index styles.`);
	}
	if (html.includes('src="./scripts/gallery/main.js"')) {
		failures.push(`${relativePath}: must not reference source-local gallery scripts.`);
	}
}

function validateSourceMetadata() {
	if (!fs.existsSync(SOURCE_METADATA_PATH)) {
		failures.push(`${projectPath(SOURCE_METADATA_PATH)}: source metadata is missing.`);
		return;
	}

	const metadata = readJson(SOURCE_METADATA_PATH);
	const entries = new Map((metadata.libraries || []).map((entry) => [entry.name, entry]));
	for (const lib of registry.libraries) {
		const entry = entries.get(lib.name);
		if (!entry) {
			failures.push(`${projectPath(SOURCE_METADATA_PATH)}: missing source metadata for ${lib.name}.`);
			continue;
		}
		for (const field of ['repository', 'ref', 'prepare', 'commit', 'examples', 'bundle', 'sketchCount']) {
			if (!entry[field] && entry[field] !== 0) {
				failures.push(`${projectPath(SOURCE_METADATA_PATH)}: ${lib.name} metadata is missing ${field}.`);
			}
		}
	}
}

function getSketchHtmlFiles() {
	return walkFiles(PUBLIC).filter((filePath) => filePath.endsWith('/sketch.html'));
}

function parseSketchImportMap(html, relativePath) {
	try {
		const importMap = parseImportMap(html);
		if (!importMap) {
			failures.push(`${relativePath}: import map is missing.`);
			return null;
		}
		return importMap;
	} catch (error) {
		failures.push(`${relativePath}: import map contains invalid JSON (${error.message}).`);
		return null;
	}
}
