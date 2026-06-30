import { useEffect, useState } from 'react';
import { normalizeManifest } from '../domain/manifest';
import type { ExampleManifest, NormalizedRegistry } from '../domain/types';
import { getLibraryHref } from '../domain/urls';
import { PageFooter } from './PageFooter';

interface LandingPageProps {
	registry: NormalizedRegistry;
}

export function LandingPage({ registry }: LandingPageProps) {
	const counts = useExampleCounts(registry);

	return (
		<div className="examples-page">
			<header className="examples-header">
				<div className="examples-brand">
					<h1>{registry.site.title}</h1>
					<p>{registry.site.tagline}</p>
				</div>
			</header>

			<main id="libraries" className="landing-grid" aria-label="Example libraries">
				{registry.libraries.map((library) => (
					<a key={library.name} href={getLibraryHref(library)} className="library-card">
						<div className="library-card-name">{library.name}</div>
						<div className="library-card-tagline">{library.tagline || ''}</div>
						<div className="library-card-desc">{library.description || ''}</div>
						<div className="library-card-footer">
							<span className="library-card-count">examples</span>
							<span
								className="library-card-count-badge"
								aria-label={`${counts[library.name] ?? 'loading'} examples`}
							>
								{counts[library.name] ?? '...'}
							</span>
						</div>
					</a>
				))}
			</main>

			<PageFooter label={registry.site.title} />
		</div>
	);
}

function useExampleCounts(registry: NormalizedRegistry) {
	const [counts, setCounts] = useState<Record<string, number>>({});

	useEffect(() => {
		let cancelled = false;

		async function loadCounts() {
			const entries = await Promise.all(
				registry.libraries.map(async (library) => {
					try {
						const response = await fetch(`/${library.folder}/manifest.json`);
						if (!response.ok) return [library.name, 0] as const;
						const manifest = (await response.json()) as ExampleManifest;
						const count = normalizeManifest(manifest).reduce(
							(total, group) => total + group.entries.length,
							0
						);
						return [library.name, count] as const;
					} catch {
						return [library.name, 0] as const;
					}
				})
			);

			if (!cancelled) {
				setCounts(Object.fromEntries(entries));
			}
		}

		void loadCounts();
		return () => {
			cancelled = true;
		};
	}, [registry]);

	return counts;
}
