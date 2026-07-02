import { lazy, MouseEvent, PointerEvent, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { filterExampleGroups } from '../domain/search';
import { flattenGroups, normalizeManifest } from '../domain/manifest';
import { createExampleRunnerDocument } from '../domain/runner';
import type { CSSProperties, RefObject } from 'react';
import type {
	ExampleManifest,
	NormalizedExample,
	NormalizedExampleGroup,
	NormalizedLibrary,
	NormalizedRegistry,
} from '../domain/types';
import {
	getExampleHref,
	getExampleRepositorySourceHref,
	getExampleSourceHref,
	getHashPath,
	setHashPath,
} from '../domain/urls';
import { PageFooter } from './PageFooter';

const CodeEditor = lazy(() => import('./CodeEditor').then((module) => ({ default: module.CodeEditor })));

interface LibraryPageProps {
	library: NormalizedLibrary;
	registry: NormalizedRegistry;
}

type LoadState =
	| { status: 'loading' }
	| { status: 'loaded'; groups: NormalizedExampleGroup[] }
	| { status: 'error'; message: string };

type SourceState =
	| { status: 'idle' }
	| { status: 'loading' }
	| { status: 'loaded'; code: string }
	| { status: 'error'; message: string };

type RunnerState =
	| { status: 'idle' }
	| { status: 'loading' }
	| { status: 'loaded'; html: string }
	| { status: 'error'; message: string };

type WorkspaceStyle = CSSProperties & {
	'--code-panel-width'?: string;
};

export function LibraryPage({ library, registry }: LibraryPageProps) {
	const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
	const [query, setQuery] = useState('');
	const [selectedPath, setSelectedPath] = useState<string | null>(() => getHashPath());
	const isSingleColumn = useMediaQuery('(max-width: 980px)');
	const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
	const previewRef = useRef<HTMLElement | null>(null);
	const shouldScrollToPreviewRef = useRef(false);

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
				const groups = normalizeManifest(manifest, library);
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
		if (isSingleColumn && selectedPath !== example.path) {
			shouldScrollToPreviewRef.current = true;
		}
		setSelectedPath(example.path);
		setHashPath(example.path);
	}

	useEffect(() => {
		if (!shouldScrollToPreviewRef.current || !selectedExample || !previewRef.current) return;
		shouldScrollToPreviewRef.current = false;
		previewRef.current.scrollIntoView({
			block: 'start',
			behavior: prefersReducedMotion ? 'auto' : 'smooth',
		});
	}, [prefersReducedMotion, selectedExample]);

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

	const libraryRepositoryUrl = `https://github.com/${library.github}`;
	const libraryLicenseUrl = `${libraryRepositoryUrl}/blob/${library.source.ref || 'main'}/LICENSE`;

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
					<div className="examples-header-controls">
						<nav className="examples-header-links" aria-label="Library links">
							<a
								className="examples-header-link"
								href={libraryRepositoryUrl}
								target="_blank"
								rel="noopener noreferrer"
							>
								github
							</a>
							<a
								className="examples-header-link"
								href={library.docsUrl}
								target="_blank"
								rel="noopener noreferrer"
							>
								docs
							</a>
						</nav>
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
				</div>
			</header>

			<main id="examples" className="examples-browser">
				{loadState.status === 'loading' ? <GalleryState message="loading examples..." /> : null}
				{loadState.status === 'error' ? (
					<GalleryState message={`Unable to load examples manifest. ${loadState.message}`} />
				) : null}
				{loadState.status === 'loaded' ? (
					<>
						{isSingleColumn ? (
							<>
								<ExampleWorkspace
									library={library}
									registry={registry}
									example={selectedExample}
									onClose={closePreview}
									panelRef={previewRef}
								/>
								<ExamplesList
									library={library}
									groups={filteredGroups}
									selectedPath={selectedExample?.path || ''}
									onSelect={selectExample}
								/>
							</>
						) : (
							<>
								<ExamplesList
									library={library}
									groups={filteredGroups}
									selectedPath={selectedExample?.path || ''}
									onSelect={selectExample}
								/>
								<ExampleWorkspace
									library={library}
									registry={registry}
									example={selectedExample}
									onClose={closePreview}
									panelRef={previewRef}
								/>
							</>
						)}
					</>
				) : null}
			</main>

			<PageFooter
				label={
					<>
						<a href={libraryRepositoryUrl} target="_blank" rel="noopener noreferrer">
							{library.name}
						</a>
						{' - '}
						<a href={libraryLicenseUrl} target="_blank" rel="noopener noreferrer">
							{library.license} license
						</a>
					</>
				}
				showDocsLink={false}
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

function ExampleWorkspace({
	library,
	registry,
	example,
	onClose,
	panelRef,
}: {
	library: NormalizedLibrary;
	registry: NormalizedRegistry;
	example: NormalizedExample | null;
	onClose: () => void;
	panelRef: RefObject<HTMLElement | null>;
}) {
	const isEmpty = !example;
	const [isCodeVisible, setIsCodeVisible] = useState(false);
	const [sourceState, setSourceState] = useState<SourceState>({ status: 'idle' });
	const [runnerState, setRunnerState] = useState<RunnerState>({ status: 'idle' });
	const [originalCode, setOriginalCode] = useState('');
	const [draftCode, setDraftCode] = useState('');
	const [runCode, setRunCode] = useState('');
	const [runRevision, setRunRevision] = useState(0);
	const [codePanelWidth, setCodePanelWidth] = useState(32);
	const sourceCacheRef = useRef(new Map<string, string>());
	const workspaceRef = useRef<HTMLDivElement | null>(null);
	const selectedCacheKey = example ? `${library.folder}/${example.path}` : '';
	const isDirty = sourceState.status === 'loaded' && draftCode !== originalCode;

	useEffect(() => {
		if (!example) {
			setIsCodeVisible(false);
			setSourceState({ status: 'idle' });
			setRunnerState({ status: 'idle' });
			setOriginalCode('');
			setDraftCode('');
			setRunCode('');
			return;
		}

		const selectedExample = example;
		let cancelled = false;
		const cachedSource = sourceCacheRef.current.get(selectedCacheKey);
		if (cachedSource !== undefined) {
			applyLoadedSource(cachedSource);
			return;
		}

		setSourceState({ status: 'loading' });
		setRunnerState({ status: 'loading' });

		async function loadSource() {
			try {
				const response = await fetch(getExampleSourceHref(library, selectedExample.path));
				if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
				const source = await response.text();
				sourceCacheRef.current.set(selectedCacheKey, source);
				if (!cancelled) applyLoadedSource(source);
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Unable to load example source.';
				if (!cancelled) {
					setSourceState({ status: 'error', message });
					setRunnerState({ status: 'error', message });
				}
			}
		}

		function applyLoadedSource(source: string) {
			setSourceState({ status: 'loaded', code: source });
			setOriginalCode(source);
			setDraftCode(source);
			setRunCode(source);
			setRunRevision((revision) => revision + 1);
		}

		void loadSource();
		return () => {
			cancelled = true;
		};
	}, [example, library, selectedCacheKey]);

	useEffect(() => {
		if (!example || sourceState.status !== 'loaded') return;

		let cancelled = false;
		setRunnerState({ status: 'loading' });
		void createExampleRunnerDocument({
			code: runCode,
			examplePath: example.path,
			library,
			registry,
		})
			.then((html) => {
				if (!cancelled) setRunnerState({ status: 'loaded', html });
			})
			.catch((error) => {
				const message = error instanceof Error ? error.message : 'Unable to prepare preview.';
				if (!cancelled) setRunnerState({ status: 'error', message });
			});

		return () => {
			cancelled = true;
		};
	}, [example, library, registry, runCode, runRevision, sourceState.status]);

	function runDraft() {
		setRunCode(draftCode);
		setRunRevision((revision) => revision + 1);
	}

	function resetDraft() {
		if (sourceState.status !== 'loaded') return;
		setDraftCode(sourceState.code);
		setOriginalCode(sourceState.code);
		setRunCode(sourceState.code);
		setRunRevision((revision) => revision + 1);
	}

	function startCodePanelResize(event: PointerEvent<HTMLButtonElement>) {
		const workspace = workspaceRef.current;
		if (!workspace) return;

		event.preventDefault();
		event.currentTarget.setPointerCapture(event.pointerId);
		const rect = workspace.getBoundingClientRect();

		function updateWidth(clientX: number) {
			const nextWidth = ((clientX - rect.left) / rect.width) * 100;
			setCodePanelWidth(clamp(nextWidth, 22, 48));
		}

		function handlePointerMove(moveEvent: globalThis.PointerEvent) {
			updateWidth(moveEvent.clientX);
		}

		function stopResize() {
			window.removeEventListener('pointermove', handlePointerMove);
			window.removeEventListener('pointerup', stopResize);
			window.removeEventListener('pointercancel', stopResize);
		}

		updateWidth(event.clientX);
		window.addEventListener('pointermove', handlePointerMove);
		window.addEventListener('pointerup', stopResize, { once: true });
		window.addEventListener('pointercancel', stopResize, { once: true });
	}

	return (
		<section
			ref={panelRef}
			className={`preview-panel${isCodeVisible ? ' has-code' : ''}`}
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
							<button
								type="button"
								className="preview-action"
								aria-pressed={isCodeVisible}
								onClick={() => setIsCodeVisible((visible) => !visible)}
							>
								code
							</button>
							<a
								className="preview-action"
								href={example.docsUrl}
								target="_blank"
								rel="noopener noreferrer"
								aria-label={`Open API docs for ${example.title}`}
							>
								docs
							</a>
							<a
								className="preview-action"
								href={getExampleRepositorySourceHref(library, example.path)}
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
			<div
				ref={workspaceRef}
				className="preview-workspace"
				data-code-visible={isCodeVisible ? 'true' : 'false'}
				style={{ '--code-panel-width': `${codePanelWidth}%` } as WorkspaceStyle}
			>
				<div className="preview-frame-shell">
					{isEmpty ? <div className="preview-empty">No sketch selected</div> : null}
					{!isEmpty && runnerState.status === 'loading' ? (
						<div className="preview-empty" role="status" aria-live="polite">
							loading preview...
						</div>
					) : null}
					{!isEmpty && runnerState.status === 'error' ? (
						<div className="preview-empty preview-error" role="alert">
							Unable to load preview. {runnerState.message}
						</div>
					) : null}
					<iframe
						key={`${selectedCacheKey}:${runRevision}`}
						className="preview-frame"
						loading="lazy"
						hidden={isEmpty || runnerState.status !== 'loaded'}
						scrolling="no"
						srcDoc={runnerState.status === 'loaded' ? runnerState.html : undefined}
						title={example ? `${example.title} preview` : undefined}
					/>
				</div>
				{example && isCodeVisible ? (
					<div className="code-panel" aria-label={`Code editor for ${example.title}`}>
						<button
							type="button"
							className="code-resize-handle"
							aria-label="Resize code editor"
							onPointerDown={startCodePanelResize}
						/>
						<div className="code-toolbar">
							<div className="code-status" role="status" aria-live="polite">
								{sourceState.status === 'loading' ? 'source loading...' : null}
								{sourceState.status === 'loaded' ? (isDirty ? 'edited' : 'original') : null}
								{sourceState.status === 'error' ? 'source unavailable' : null}
							</div>
							<div className="code-actions">
								<button
									type="button"
									className="preview-action"
									disabled={sourceState.status !== 'loaded'}
									onClick={runDraft}
								>
									run
								</button>
								<button
									type="button"
									className="preview-action"
									disabled={sourceState.status !== 'loaded' || !isDirty}
									onClick={resetDraft}
								>
									reset
								</button>
							</div>
						</div>
						{sourceState.status === 'error' ? (
							<div className="code-error" role="alert">
								Unable to load source. {sourceState.message}
							</div>
						) : (
							<div className="code-editor-shell">
								<Suspense
									fallback={
										<div className="code-loading" role="status" aria-live="polite">
											loading editor...
										</div>
									}
								>
									<CodeEditor
										ariaLabel={`Code editor for ${example.title}`}
										value={sourceState.status === 'loaded' ? draftCode : ''}
										onChange={setDraftCode}
										onRunShortcut={runDraft}
										editable={sourceState.status === 'loaded'}
									/>
								</Suspense>
							</div>
						)}
					</div>
				) : null}
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

function useMediaQuery(query: string) {
	const [matches, setMatches] = useState(() => getMediaQueryMatches(query));

	useEffect(() => {
		if (typeof window.matchMedia !== 'function') return;
		const mediaQuery = window.matchMedia(query);
		const updateMatches = () => setMatches(mediaQuery.matches);

		updateMatches();
		if (typeof mediaQuery.addEventListener === 'function') {
			mediaQuery.addEventListener('change', updateMatches);
			return () => mediaQuery.removeEventListener('change', updateMatches);
		}

		mediaQuery.addListener(updateMatches);
		return () => mediaQuery.removeListener(updateMatches);
	}, [query]);

	return matches;
}

function getMediaQueryMatches(query: string) {
	if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
	return window.matchMedia(query).matches;
}

function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
}
