import { LIBRARIES_PATH } from './paths.mjs';
import { readJson } from './files.mjs';

export const DEFAULT_DOCS_URL = 'https://code.textmode.art';
export const IMPRINT_URL = 'https://legal.textmode.art/projects/examples.textmode.art/en/imprint';
export const PRIVACY_URL = 'https://legal.textmode.art/projects/examples.textmode.art/en/privacy';
export const LANDING_PAGE_VERSION = 'portal-2';

export function loadRegistry() {
	const registry = readJson(LIBRARIES_PATH);
	return {
		site: {
			title: registry.site?.title || 'examples.textmode.art',
			tagline: registry.site?.tagline || '// shared examples gallery for the textmode.js ecosystem',
		},
		libraries: (registry.libraries || []).map((lib) => ({
			...lib,
			docsUrl: lib.docsUrl || DEFAULT_DOCS_URL,
		})),
	};
}

export function validateLibrary(lib) {
	const missing = [];
	for (const field of ['name', 'repo', 'folder', 'bundle', 'github', 'license']) {
		if (!lib[field]) missing.push(field);
	}
	if (!lib.source?.repository) missing.push('source.repository');
	return missing;
}
