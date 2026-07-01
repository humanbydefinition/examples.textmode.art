import registryJson from '../../libraries.json';
import { getDefaultLibraryDocsHref } from './docs';
import type { LibraryConfig, LibraryRegistry, NormalizedLibrary, NormalizedRegistry } from './types';

export const IMPRINT_URL = 'https://legal.textmode.art/projects/examples.textmode.art/en/imprint';
export const PRIVACY_URL = 'https://legal.textmode.art/projects/examples.textmode.art/en/privacy';

export function normalizeRegistry(input: unknown): NormalizedRegistry {
	const registry = input as Partial<LibraryRegistry>;
	return {
		site: {
			title: registry.site?.title || 'examples.textmode.art',
			tagline: registry.site?.tagline || '// shared examples gallery for the textmode.js ecosystem',
		},
		libraries: Array.isArray(registry.libraries)
			? registry.libraries.map((library) => normalizeLibrary(library))
			: [],
	};
}

export function normalizeLibrary(library: LibraryConfig): NormalizedLibrary {
	return {
		...library,
		docsUrl: library.docsUrl || getDefaultLibraryDocsHref(library.name),
	};
}

export function validateLibraryConfig(library: Partial<LibraryConfig>): string[] {
	const missing: string[] = [];
	for (const field of ['name', 'repo', 'folder', 'bundle', 'github', 'license'] as const) {
		if (!library[field]) missing.push(field);
	}
	if (!library.source?.repository) missing.push('source.repository');
	return missing;
}

export const registry = normalizeRegistry(registryJson);
