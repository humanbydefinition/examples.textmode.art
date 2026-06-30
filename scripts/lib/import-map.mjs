export const IMPORT_MAP_PATH_PREFIX = '../vendor';

export function buildImportMap(libraries) {
	const imports = Object.fromEntries(
		libraries.map((lib) => [lib.name, `${IMPORT_MAP_PATH_PREFIX}/${lib.name}/index.js`])
	);
	return `<script type="importmap">
${JSON.stringify({ imports }, null, 2)}
</script>
`;
}

export function hasConfiguredImport(importMapHtml, libraries) {
	return libraries.some((lib) => importMapHtml.includes(`"${lib.name}"`));
}

export function parseImportMap(html) {
	const match = html.match(/<script type="importmap">([\s\S]*?)<\/script>/);
	if (!match) return null;
	return JSON.parse(match[1]);
}
