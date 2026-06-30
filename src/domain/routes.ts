import type { NormalizedLibrary, NormalizedRegistry } from './types';

export type AppRoute =
	| { kind: 'landing' }
	| { kind: 'library'; library: NormalizedLibrary }
	| { kind: 'not-found'; requestedPath: string };

export function getRouteFromPath(pathname: string, registry: NormalizedRegistry): AppRoute {
	const segments = pathname.split('/').filter(Boolean);
	const firstSegment = decodeURIComponent(segments[0] || '');

	if (!firstSegment || firstSegment === 'index.html') {
		return { kind: 'landing' };
	}

	const library = registry.libraries.find((item) => item.folder === firstSegment || item.name === firstSegment);
	if (library) {
		return { kind: 'library', library };
	}

	return { kind: 'not-found', requestedPath: pathname };
}
