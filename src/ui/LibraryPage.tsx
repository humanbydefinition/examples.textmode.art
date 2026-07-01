import { MouseEvent, useEffect, useMemo, useState } from 'react';
import { filterExampleGroups } from '../domain/search';
import { flattenGroups, normalizeManifest } from '../domain/manifest';
import type {
	ExampleManifest,
	NormalizedExample,
	NormalizedExampleGroup,
	NormalizedLibrary,
	NormalizedRegistry,
} from '../domain/types';
import { getExampleHref, getExampleSourceHref, getHashPath, setHashPath } from '../domain/urls';
import { PageFooter } from './PageFooter';

interface LibraryPageProps {
	library: NormalizedLibrary;
	registry: NormalizedRegistry;
}

type LoadState =
	| { status: 'loading' }
	| { status: 'loaded'; groups: NormalizedExampleGroup[] }
	| { status: 'error'; message: string };

export function LibraryPage({ library }: LibraryPageProps) {
	const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
	const [query, setQuery] = useState('');
	const [selectedPath, setSelectedPath] = useState<string | null>(() => getHashPath());

	useEffect(() => {
		let cancelled = false;

		async function loadManifest() {
			setLoadState({ status: 'loading' });
			try {
				const response = await fetch(`/${library.folder}/manifest.json`);
				if (!response.ok) {
					throw new Error(`${response.status} ${response.statusText}`);
				}
				const manifest = (await response.json()) as ExampleManifest;
				const groups = normalizeManifest(manifest);
				if (!cancelled) setLoadState({ status: 'loaded', groups });
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Unable to load examples manifest.';
				if (!cancelled) setLoadState({ status: 'error', message });
			}
		}

		void loadManifest();
		return () => {
			cancelled = true;
		};
	}, [library.folder]);

	useEffect(() => {
		const handleHashChange = () => setSelectedPath(getHashPath());
		window.addEventListener('hashchange', handleHashChange);
		return () => window.removeEventListener('hashchange', handleHashChange);
	}, []);

	const filteredGroups = useMemo(() => {
		if (loadState.status !== 'loaded') return [];
		return filterExampleGroups(loadState.groups, query);
	}, [loadState, query]);

	const visibleExamples = useMemo(() => flattenGroups(filteredGroups), [filteredGroups]);
	const selectedExample = visibleExamples.find((entry) => entry.path === selectedPath) ?? null;

	useEffect(() => {
		if (loadState.status !== 'loaded') return;
		if (selectedPath === '' && visibleExamples[0]) {
			setSelectedPath(visibleExamples[0].path);
			return;
		}
		if (selectedPath && !visibleExamples.some((entry) => entry.path === selectedPath)) {
			setSelectedPath(null);
			setHashPath(null);
		}
	}, [loadState, selectedPath, visibleExamples]);

	function selectExample(example: NormalizedExample) {
		setSelectedPath(example.path);
		setHashPath(example.path);
	}

	function closePreview() {
		const previousPath = selectedPath;
		setSelectedPath(null);
		setHashPath(null);
		window.setTimeout(() => {
			if (previousPath) {
				document.querySelector<HTMLAnchorElement>(`[data-entry-path="${CSS.escape(previousPath)}"]`)?.focus();
			}
		}, 0);
	}

	const footerLabel = library.license ? `${library.name} - ${library.license} license` : `${library.name} examples`;

	return (
		<div className="examples-page">
			<header className="examples-header">
				<nav className="examples-breadcrumb" aria-label="Breadcrumb">
					<a href="/" aria-label="Back to all example libraries">
						<span aria-hidden="true">&larr;</span>
						<span>all libraries</span>
					</a>
				</nav>
				<div className="examples-header-primary">
					<div className="examples-brand">
						<h1>{library.name}</h1>
						<p>{library.tagline || library.description || ''}</p>
					</div>
					<label className="examples-search" htmlFor="search">
						<span className="examples-search-icon" aria-hidden="true">
							/
						</span>
						<input
							id="search"
							type="text"
							placeholder="filter examples..."
							aria-label="Filter examples"
							autoComplete="off"
							spellCheck={false}
							value={query}
							onChange={(event) => setQuery(event.target.value)}
						/>
					</label>
				</div>
			</header>

			<main id="examples" className="examples-browser">
				{loadState.status === 'loading' ? <GalleryState message="loading examples..." /> : null}
				{loadState.status === 'error' ? (
					<GalleryState message={`Unable to load examples manifest. ${loadState.message}`} />
				) : null}
				{loadState.status === 'loaded' ? (
					<>
						<ExamplesList
							library={library}
							groups={filteredGroups}
							selectedPath={selectedExample?.path || ''}
							onSelect={selectExample}
						/>
						<PreviewPanel library={library} example={selectedExample} onClose={closePreview} />
					</>
				) : null}
			</main>

			<PageFooter
				label={footerLabel}
				githubUrl={`https://github.com/${library.github}`}
				docsUrl={library.docsUrl}
			/>
		</div>
	);
}

function ExamplesList({
	library,
	groups,
	selectedPath,
	onSelect,
}: {
	library: NormalizedLibrary;
	groups: NormalizedExampleGroup[];
	selectedPath: string;
	onSelect: (example: NormalizedExample) => void;
}) {
	if (groups.length === 0) {
		return (
			<section className="examples-list-panel" aria-label="Examples" aria-live="polite">
				<p className="gallery-state">No matching examples.</p>
			</section>
		);
	}

	return (
		<section className="examples-list-panel" aria-label="Examples">
			{groups.map((group, index) => (
				<details
					key={group.name}
					className="example-group"
					open={
						group.entries.length <= 12 ||
						index < 2 ||
						group.entries.some((entry) => entry.path === selectedPath)
					}
				>
					<summary className="group-summary">
						<span className="group-title">{group.name}</span>
						<span className="group-description">{group.description}</span>
						<span className="group-count">{group.entries.length}</span>
					</summary>
					<div className="group-content">
						{group.subgroups.map((subgroup) => (
							<div className="subgroup-block" key={subgroup.name || group.name}>
								{subgroup.name ? (
									<div className="subgroup-header">
										<span>{subgroup.name}</span>
										<span className="subgroup-count">{subgroup.entries.length}</span>
									</div>
								) : null}
								<div className="entry-list">
									{subgroup.entries.map((entry) => (
										<ExampleLink
											key={entry.path}
											library={library}
											entry={entry}
											isActive={entry.path === selectedPath}
											onSelect={onSelect}
										/>
									))}
								</div>
							</div>
						))}
					</div>
				</details>
			))}
		</section>
	);
}

function ExampleLink({
	library,
	entry,
	isActive,
	onSelect,
}: {
	library: NormalizedLibrary;
	entry: NormalizedExample;
	isActive: boolean;
	onSelect: (example: NormalizedExample) => void;
}) {
	function handleClick(event: MouseEvent<HTMLAnchorElement>) {
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
		event.preventDefault();
		onSelect(entry);
	}

	return (
		<a
			href={getExampleHref(library, entry.path)}
			className={`entry-link${isActive ? ' is-active' : ''}`}
			data-entry-path={entry.path}
			aria-current={isActive ? 'true' : 'false'}
			title={entry.title}
			onClick={handleClick}
		>
			{entry.name}
		</a>
	);
}

function PreviewPanel({
	library,
	example,
	onClose,
}: {
	library: NormalizedLibrary;
	example: NormalizedExample | null;
	onClose: () => void;
}) {
	const isEmpty = !example;
	const frameSrc = example ? getExampleHref(library, example.path) : 'about:blank';

	return (
		<section
			className="preview-panel"
			data-empty={isEmpty ? 'true' : 'false'}
			aria-label="Selected example preview"
		>
			<div className="preview-toolbar">
				<div className="preview-meta">
					<div className="preview-kicker">{example ? previewKicker(example) : 'Preview'}</div>
					<h2 className="preview-title">{example ? example.title : 'No sketch selected'}</h2>
				</div>
				<div className="preview-actions">
					{example ? (
						<>
							<a
								className="preview-action"
								href={getExampleSourceHref(library, example.path)}
								target="_blank"
								rel="noopener noreferrer"
							>
								source
							</a>
							<a
								className="preview-action"
								href={getExampleHref(library, example.path)}
								target="_blank"
								rel="noopener noreferrer"
							>
								open
							</a>
							<button type="button" className="preview-action" onClick={onClose}>
								close
							</button>
						</>
					) : null}
				</div>
			</div>
			<div className="preview-frame-shell">
				{isEmpty ? <div className="preview-empty">No sketch selected</div> : null}
				<iframe
					className="preview-frame"
					loading="lazy"
					hidden={isEmpty}
					src={frameSrc}
					title={example ? `${example.title} preview` : undefined}
				/>
			</div>
		</section>
	);
}

function GalleryState({ message }: { message: string }) {
	return (
		<p className="gallery-state" role="status" aria-live="polite">
			{message}
		</p>
	);
}

function previewKicker(example: NormalizedExample) {
	return example.subgroup ? `${example.group} / ${example.subgroup}` : example.group;
}
