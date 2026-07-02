import { init, parse } from 'es-module-lexer';
import { isValidExamplePath } from './manifest';
import type { NormalizedLibrary, NormalizedRegistry } from './types';

const TEXT_IMPORT_EXTENSIONS = new Set(['.frag', '.glsl', '.vert', '.fs', '.vs', '.txt']);

export interface RunnerDocumentOptions {
	code: string;
	examplePath: string;
	library: NormalizedLibrary;
	registry: NormalizedRegistry;
	loadText?: (url: string) => Promise<string>;
}

export async function createExampleRunnerDocument({
	code,
	examplePath,
	library,
	registry,
	loadText = loadTextFromUrl,
}: RunnerDocumentOptions): Promise<string> {
	if (!isValidExamplePath(examplePath)) {
		throw new Error(`Invalid example path: ${examplePath}`);
	}

	const transformedCode = await transformExampleModule({
		code,
		examplePath,
		libraryFolder: library.folder,
		loadText,
	});
	const hasModuleSyntax = await hasStaticModuleSyntax(code);
	const runnerModule = buildRunnerModule({
		code,
		hasModuleSyntax,
		libraryName: library.name,
		transformedCode,
	});
	const importMap = JSON.stringify(
		{
			imports: Object.fromEntries(
				registry.libraries.map((entry) => [entry.name, `/vendor/${entry.name}/index.js`])
			),
		},
		null,
		2
	);

	return `<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<title>${escapeHtml(library.name)} - ${escapeHtml(examplePath)}</title>
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<base href="/${encodePathSegment(library.folder)}/${encodePath(examplePath)}/" />
		<script type="importmap">${escapeScript(importMap)}</script>
		<style>
			html, body {
				width: 100%;
				height: 100%;
				min-height: 0;
				margin: 0;
				overflow: hidden;
				background: #09090b;
				color: #f4f4f5;
			}
			body {
				position: fixed;
				inset: 0;
			}
			canvas {
				display: block;
			}
			.runner-error {
				position: fixed;
				right: 0.75rem;
				bottom: 0.75rem;
				left: 0.75rem;
				z-index: 2147483647;
				padding: 0.75rem;
				border: 1px solid #7f1d1d;
				border-radius: 0.375rem;
				background: rgba(24, 24, 27, 0.96);
				color: #fca5a5;
				font: 12px/1.45 ui-monospace, SFMono-Regular, Consolas, monospace;
				white-space: pre-wrap;
			}
		</style>
	</head>
	<body>
		<script>
			const showRunnerError = (message) => {
				let panel = document.querySelector('.runner-error');
				if (!panel) {
					panel = document.createElement('pre');
					panel.className = 'runner-error';
					panel.setAttribute('role', 'alert');
					document.body.appendChild(panel);
				}
				panel.textContent = String(message || 'Unknown runtime error.');
			};
			window.addEventListener('error', (event) => showRunnerError(event.message));
			window.addEventListener('unhandledrejection', (event) => showRunnerError(event.reason?.stack || event.reason));
		</script>
		<script type="module">
${escapeScript(runnerModule)}
		</script>
	</body>
</html>`;
}

export interface TransformModuleOptions {
	code: string;
	examplePath: string;
	libraryFolder: string;
	loadText?: (url: string) => Promise<string>;
}

export async function transformExampleModule({
	code,
	examplePath,
	libraryFolder,
	loadText = loadTextFromUrl,
}: TransformModuleOptions): Promise<string> {
	if (!isValidExamplePath(examplePath)) {
		throw new Error(`Invalid example path: ${examplePath}`);
	}

	await init;
	const [imports] = parse(code);
	let transformed = code;

	for (const imported of [...imports].reverse()) {
		const specifier = imported.n;
		if (!specifier || !specifier.startsWith('.')) continue;

		const replacement = await resolveExampleImport(specifier, {
			examplePath,
			libraryFolder,
			loadText,
		});
		transformed = `${transformed.slice(0, imported.s)}${replacement}${transformed.slice(imported.e)}`;
	}

	return transformed;
}

async function hasStaticModuleSyntax(code: string) {
	await init;
	const [imports, exports] = parse(code);
	return exports.length > 0 || imports.some((imported) => imported.d === -1);
}

function buildRunnerModule({
	code,
	hasModuleSyntax,
	libraryName,
	transformedCode,
}: {
	code: string;
	hasModuleSyntax: boolean;
	libraryName: string;
	transformedCode: string;
}) {
	const runtime = getRuntimeGlobals(libraryName);
	const prelude = `${runtime.imports}
${runtime.assignments}`;

	if (hasModuleSyntax) {
		return `${prelude}
${buildLexicalBindings(code, runtime.globals)}
${transformedCode}`;
	}

	return `${prelude}
const __textmodeRunnerScript = document.createElement('script');
__textmodeRunnerScript.text = ${escapeScript(JSON.stringify(code))};
document.body.appendChild(__textmodeRunnerScript);`;
}

function getRuntimeGlobals(libraryName: string) {
	const imports = [`import * as __textmodeModule from 'textmode.js';`];
	const globals: Record<string, string> = {
		textmode: '__textmodeModule.textmode',
		TextmodeErrorLevel: '__textmodeModule.TextmodeErrorLevel ?? __textmodeModule.errors?.TextmodeErrorLevel',
		LayerBlendMode: '__textmodeModule.LayerBlendMode',
	};

	if (libraryName !== 'textmode.js') {
		imports.push(`import * as __addonModule from '${libraryName}';`);
	}

	if (libraryName === 'textmode.filters.js') {
		globals.FiltersPlugin = '__addonModule.FiltersPlugin';
	}

	if (libraryName === 'textmode.synth.js') {
		Object.assign(globals, {
			SynthPlugin: '__addonModule.SynthPlugin',
			SynthSource: '__addonModule.SynthSource',
			osc: '__addonModule.osc',
			noise: '__addonModule.noise',
			voronoi: '__addonModule.voronoi',
			gradient: '__addonModule.gradient',
			shape: '__addonModule.shape',
			solid: '__addonModule.solid',
			plasma: '__addonModule.plasma',
			moire: '__addonModule.moire',
			src: '__addonModule.src',
			cellColor: '__addonModule.cellColor',
			charColor: '__addonModule.charColor',
			char: '__addonModule.char',
			paint: '__addonModule.paint',
		});
	}

	if (libraryName === 'textmode.export.js') {
		Object.assign(globals, {
			ExportPlugin: '__addonModule.ExportPlugin',
			createTextmodeExportPlugin: '__addonModule.createTextmodeExportPlugin',
		});
	}

	if (libraryName === 'textmode.figlet.js') {
		Object.assign(globals, {
			FigletPlugin: '__addonModule.FigletPlugin',
			TextmodeFigFont: '__addonModule.TextmodeFigFont',
		});
	}

	return {
		imports: imports.join('\n'),
		assignments: Object.entries(globals)
			.map(([name, expression]) => `window.${name} = ${expression};`)
			.join('\n'),
		globals,
	};
}

function buildLexicalBindings(code: string, globals: Record<string, string>) {
	return Object.entries(globals)
		.filter(([name]) => usesIdentifier(code, name) && !hasLocalBinding(code, name))
		.map(([name]) => `const ${name} = window.${name};`)
		.join('\n');
}

function usesIdentifier(code: string, name: string) {
	return new RegExp(`\\b${escapeRegExp(name)}\\b`).test(code);
}

function hasLocalBinding(code: string, name: string) {
	const escapedName = escapeRegExp(name);
	return (
		new RegExp(`\\b(?:const|let|var|function|class)\\s+${escapedName}\\b`).test(code) ||
		new RegExp(
			`\\bimport\\s+(?:[^'";]*\\b${escapedName}\\b[^'";]*\\s+from|\\{[^}]*\\b${escapedName}\\b[^}]*\\}\\s+from)`
		).test(code)
	);
}

async function resolveExampleImport(
	specifier: string,
	{
		examplePath,
		libraryFolder,
		loadText,
	}: {
		examplePath: string;
		libraryFolder: string;
		loadText: (url: string) => Promise<string>;
	}
) {
	const baseUrl = new URL(`/${libraryFolder}/${examplePath}/`, window.location.origin);
	const resolvedUrl = new URL(specifier, baseUrl);
	const extension = getExtension(resolvedUrl.pathname);

	if (TEXT_IMPORT_EXTENSIONS.has(extension)) {
		const text = await loadText(resolvedUrl.pathname);
		return toModuleDataUrl(`export default ${JSON.stringify(text)};`);
	}

	if (extension) {
		return resolvedUrl.pathname;
	}

	return `${resolvedUrl.pathname}.js`;
}

async function loadTextFromUrl(url: string) {
	const response = await fetch(url);
	if (!response.ok) throw new Error(`Unable to load ${url}: ${response.status} ${response.statusText}`);
	return response.text();
}

function getExtension(pathname: string) {
	const filename = pathname.split('/').pop() || '';
	const dotIndex = filename.lastIndexOf('.');
	return dotIndex > -1 ? filename.slice(dotIndex) : '';
}

function toModuleDataUrl(code: string) {
	return `data:text/javascript;charset=utf-8,${encodeURIComponent(code)}`;
}

function escapeHtml(value: string) {
	return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function escapeScript(value: string) {
	return value.replaceAll('</script', '<\\/script');
}

function escapeRegExp(value: string) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function encodePath(path: string) {
	return path.split('/').map(encodePathSegment).join('/');
}

function encodePathSegment(segment: string) {
	return encodeURIComponent(segment);
}
