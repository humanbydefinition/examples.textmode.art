import type { NormalizedLibrary } from './types';

export function getLibraryHref(library: NormalizedLibrary): string {
	return `/${library.folder}/`;
}

export function getExampleHref(library: NormalizedLibrary, examplePath: string): string {
	return `/${library.folder}/sketch.html?path=${encodeURIComponent(examplePath)}`;
}

export function getExampleSourceHref(library: NormalizedLibrary, examplePath: string): string {
	return `/${library.folder}/${examplePath}/sketch.js`;
}

export function getHashPath(): string {
	const hash = window.location.hash.slice(1);
	if (!hash) return '';

	try {
		return decodeURIComponent(hash);
	} catch {
		return hash;
	}
}

export function setHashPath(examplePath: string | null): void {
	const pathAndSearch = `${window.location.pathname}${window.location.search}`;
	const hash = examplePath ? `#${encodeURIComponent(examplePath)}` : '';
	window.history.replaceState(null, '', `${pathAndSearch}${hash}`);
}
