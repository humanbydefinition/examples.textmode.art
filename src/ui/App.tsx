import { getRouteFromPath } from '../domain/routes';
import { registry } from '../domain/registry';
import { LandingPage } from './LandingPage';
import { LibraryPage } from './LibraryPage';
import { NotFoundPage } from './NotFoundPage';

export function App() {
	const route = getRouteFromPath(window.location.pathname, registry);

	if (route.kind === 'library') {
		return <LibraryPage library={route.library} registry={registry} />;
	}

	if (route.kind === 'not-found') {
		return <NotFoundPage requestedPath={route.requestedPath} registry={registry} />;
	}

	return <LandingPage registry={registry} />;
}
