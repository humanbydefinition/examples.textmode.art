import type { NormalizedRegistry } from '../domain/types';
import { PageFooter } from './PageFooter';

interface NotFoundPageProps {
	requestedPath: string;
	registry: NormalizedRegistry;
}

export function NotFoundPage({ requestedPath, registry }: NotFoundPageProps) {
	return (
		<div className="examples-page examples-page-centered">
			<header className="examples-header">
				<div className="examples-brand">
					<h1>Library not found</h1>
					<p>{requestedPath}</p>
				</div>
			</header>

			<main className="not-found-panel" aria-live="polite">
				<p>No configured example library matches this path.</p>
				<a className="preview-action" href="/">
					all libraries
				</a>
			</main>

			<PageFooter label={registry.site.title} />
		</div>
	);
}
