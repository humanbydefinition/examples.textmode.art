import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../../src/ui/App';

vi.mock('@uiw/react-codemirror', () => ({
	default: ({
		'aria-label': ariaLabel,
		onChange,
		value,
	}: {
		'aria-label': string;
		onChange: (value: string) => void;
		value: string;
	}) => <textarea aria-label={ariaLabel} onChange={(event) => onChange(event.target.value)} value={value} />,
}));

vi.mock('@codemirror/lang-javascript', () => ({
	javascript: () => [],
}));

vi.mock('@codemirror/theme-one-dark', () => ({
	oneDark: [],
}));

const textmodeManifest = {
	groups: [
		{
			name: 'Textmodifier',
			description: 'Drawing',
			examples: [
				{ title: 'Textmodifier.rect', sourceFile: 'examples/Textmodifier/rect/sketch.js' },
				{ title: 'Textmodifier.circle', sourceFile: 'examples/Textmodifier/circle/sketch.js' },
			],
		},
	],
};

const synthManifest = {
	groups: [
		{
			name: 'SynthSource',
			subgroups: [
				{
					name: 'Sources',
					examples: [{ title: 'SynthSource.osc', sourceFile: 'examples/SynthSource/osc/sketch.js' }],
				},
			],
		},
	],
};

describe('App', () => {
	let scrollIntoView: ReturnType<typeof vi.fn>;
	let originalScrollIntoView: typeof Element.prototype.scrollIntoView;

	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn(mockFetch));
		originalScrollIntoView = Element.prototype.scrollIntoView;
		scrollIntoView = vi.fn();
		Object.defineProperty(Element.prototype, 'scrollIntoView', {
			configurable: true,
			value: scrollIntoView,
		});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		Object.defineProperty(Element.prototype, 'scrollIntoView', {
			configurable: true,
			value: originalScrollIntoView,
		});
		window.history.replaceState(null, '', '/');
	});

	it('renders the landing page and fetched example counts', async () => {
		window.history.replaceState(null, '', '/');

		render(<App />);

		expect(screen.getByRole('heading', { name: 'examples.textmode.art' })).toBeInTheDocument();
		const siteLinks = within(screen.getByRole('navigation', { name: 'Site links' }));
		expect(siteLinks.getByRole('link', { name: 'github' })).toHaveAttribute(
			'href',
			'https://github.com/humanbydefinition/examples.textmode.art'
		);
		expect(siteLinks.getByRole('link', { name: 'github' })).toHaveAttribute('target', '_blank');
		expect(siteLinks.getByRole('link', { name: 'github' })).toHaveAttribute('rel', 'noopener noreferrer');
		expect(siteLinks.getByRole('link', { name: 'docs' })).toHaveAttribute('href', 'https://code.textmode.art');
		expect(siteLinks.getByRole('link', { name: 'docs' })).toHaveAttribute('target', '_blank');
		expect(siteLinks.getByRole('link', { name: 'docs' })).toHaveAttribute('rel', 'noopener noreferrer');
		const footerLinks = within(screen.getByRole('navigation', { name: 'Project links' }));
		expect(footerLinks.queryByRole('link', { name: 'docs' })).not.toBeInTheDocument();
		expect(screen.queryByRole('link', { name: '@humanbydefinition' })).not.toBeInTheDocument();
		expect(
			screen.getAllByRole('link').find((link) => link.getAttribute('href') === '/textmode.js/')
		).toBeInTheDocument();
		const footer = within(screen.getByRole('contentinfo'));
		expect(footer.getByRole('link', { name: 'examples.textmode.art' })).toHaveAttribute(
			'href',
			'https://github.com/humanbydefinition/examples.textmode.art'
		);
		expect(footer.getByRole('link', { name: 'examples.textmode.art' })).toHaveAttribute('target', '_blank');
		expect(footer.getByRole('link', { name: 'examples.textmode.art' })).toHaveAttribute(
			'rel',
			'noopener noreferrer'
		);
		expect(footer.getByRole('link', { name: 'AGPL-3.0 license' })).toHaveAttribute(
			'href',
			'https://github.com/humanbydefinition/examples.textmode.art/blob/main/LICENSE'
		);
		expect(footer.getByRole('link', { name: 'AGPL-3.0 license' })).toHaveAttribute('target', '_blank');
		expect(footer.getByRole('link', { name: 'AGPL-3.0 license' })).toHaveAttribute(
			'rel',
			'noopener noreferrer'
		);

		await waitFor(() => {
			expect(screen.getByLabelText('2 examples')).toHaveTextContent('2');
		});
	});

	it('renders a library page, filters entries, and opens and closes a preview', async () => {
		window.history.replaceState(null, '', '/textmode.js/');

		render(<App />);

		await screen.findByRole('heading', { name: 'textmode.js' });
		const libraryLinks = within(screen.getByRole('navigation', { name: 'Library links' }));
		expect(libraryLinks.getByRole('link', { name: 'github' })).toHaveAttribute(
			'href',
			'https://github.com/humanbydefinition/textmode.js'
		);
		expect(libraryLinks.getByRole('link', { name: 'github' })).toHaveAttribute('target', '_blank');
		expect(libraryLinks.getByRole('link', { name: 'github' })).toHaveAttribute('rel', 'noopener noreferrer');
		expect(libraryLinks.getByRole('link', { name: 'docs' })).toHaveAttribute(
			'href',
			'https://code.textmode.art/api/textmode.js/'
		);
		expect(libraryLinks.getByRole('link', { name: 'docs' })).toHaveAttribute('target', '_blank');
		expect(libraryLinks.getByRole('link', { name: 'docs' })).toHaveAttribute('rel', 'noopener noreferrer');
		const footerLinks = within(screen.getByRole('navigation', { name: 'Project links' }));
		expect(footerLinks.queryByRole('link', { name: 'github' })).not.toBeInTheDocument();
		expect(footerLinks.queryByRole('link', { name: 'docs' })).not.toBeInTheDocument();
		expect(footerLinks.getByRole('link', { name: 'imprint' })).toBeInTheDocument();
		expect(footerLinks.getByRole('link', { name: 'privacy' })).toBeInTheDocument();
		const footer = within(screen.getByRole('contentinfo'));
		expect(footer.getByRole('link', { name: 'textmode.js' })).toHaveAttribute(
			'href',
			'https://github.com/humanbydefinition/textmode.js'
		);
		expect(footer.getByRole('link', { name: 'textmode.js' })).toHaveAttribute('target', '_blank');
		expect(footer.getByRole('link', { name: 'textmode.js' })).toHaveAttribute('rel', 'noopener noreferrer');
		expect(footer.getByRole('link', { name: 'MIT license' })).toHaveAttribute(
			'href',
			'https://github.com/humanbydefinition/textmode.js/blob/main/LICENSE'
		);
		expect(footer.getByRole('link', { name: 'MIT license' })).toHaveAttribute('target', '_blank');
		expect(footer.getByRole('link', { name: 'MIT license' })).toHaveAttribute('rel', 'noopener noreferrer');
		expect(
			isBefore(
				screen.getByRole('navigation', { name: 'Library links' }),
				screen.getByLabelText('Filter examples')
			)
		).toBe(true);

		const rect = await screen.findByRole('link', { name: 'rect' });
		expect(
			isBefore(
				screen.getByRole('region', { name: 'Examples' }),
				screen.getByRole('region', { name: 'Selected example preview' })
			)
		).toBe(true);
		await waitFor(() => {
			expect(rect).toHaveAttribute('aria-current', 'true');
		});
		await waitFor(() => {
			expect(screen.getByTitle('Textmodifier.rect preview')).toHaveAttribute(
				'srcdoc',
				expect.stringContaining('textmode.create();')
			);
		});
		expect(screen.getByTitle('Textmodifier.rect preview')).toHaveAttribute('scrolling', 'no');
		expect(screen.getByRole('link', { name: 'Open API docs for Textmodifier.rect' })).toHaveAttribute(
			'href',
			'https://code.textmode.art/api/textmode.js/classes/Textmodifier#rect'
		);
		expect(screen.getByRole('link', { name: 'Open API docs for Textmodifier.rect' })).toHaveAttribute(
			'target',
			'_blank'
		);
		expect(screen.getByRole('link', { name: 'Open API docs for Textmodifier.rect' })).toHaveAttribute(
			'rel',
			'noopener noreferrer'
		);
		expect(screen.getByRole('link', { name: 'source' })).toHaveAttribute(
			'href',
			'https://github.com/humanbydefinition/textmode.js/blob/main/examples/Textmodifier/rect/sketch.js'
		);
		expect(screen.getByRole('link', { name: 'source' })).toHaveAttribute('target', '_blank');
		expect(screen.getByRole('link', { name: 'source' })).toHaveAttribute('rel', 'noopener noreferrer');
		expect(document.querySelector('.preview-actions')?.textContent).toBe('codedocssourceopenclose');

		fireEvent.change(screen.getByLabelText('Filter examples'), { target: { value: 'circle' } });

		expect(screen.queryByRole('link', { name: 'rect' })).not.toBeInTheDocument();
		const circle = screen.getByRole('link', { name: 'circle' });
		fireEvent.click(circle);

		expect(circle).toHaveAttribute('aria-current', 'true');
		expect(window.location.hash).toBe('#Textmodifier%2Fcircle');
		expect(scrollIntoView).not.toHaveBeenCalled();
		await waitFor(() => {
			expect(screen.getByTitle('Textmodifier.circle preview')).toHaveAttribute(
				'srcdoc',
				expect.stringContaining('textmode.circle();')
			);
		});

		fireEvent.click(screen.getByRole('button', { name: 'close' }));

		expect(screen.getAllByText('No sketch selected')).toHaveLength(2);
		expect(screen.queryByRole('link', { name: /Open API docs for/ })).not.toBeInTheDocument();
		expect(screen.queryByRole('button', { name: 'code' })).not.toBeInTheDocument();
		await waitFor(() => expect(circle).toHaveFocus());
		expect(scrollIntoView).not.toHaveBeenCalled();
		expect(window.location.hash).toBe('');
	});

	it('puts the preview first and scrolls to it after mobile example selection', async () => {
		mockMatchMedia({ singleColumn: true, reducedMotion: false });
		window.history.replaceState(null, '', '/textmode.js/');

		render(<App />);

		await screen.findByRole('heading', { name: 'textmode.js' });
		await screen.findByRole('link', { name: 'rect' });
		expect(
			isBefore(
				screen.getByRole('region', { name: 'Selected example preview' }),
				screen.getByRole('region', { name: 'Examples' })
			)
		).toBe(true);
		expect(scrollIntoView).not.toHaveBeenCalled();

		fireEvent.click(await screen.findByRole('link', { name: 'circle' }));

		await waitFor(() => {
			expect(screen.getByTitle('Textmodifier.circle preview')).toHaveAttribute(
				'srcdoc',
				expect.stringContaining('textmode.circle();')
			);
			expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start', behavior: 'smooth' });
		});
	});

	it('toggles a live code editor, runs edits, and resets to the original source', async () => {
		window.history.replaceState(null, '', '/textmode.js/');

		render(<App />);

		await screen.findByRole('heading', { name: 'textmode.js' });
		await waitFor(() => {
			expect(screen.getByTitle('Textmodifier.rect preview')).toHaveAttribute(
				'srcdoc',
				expect.stringContaining('textmode.create();')
			);
		});

		const codeButton = screen.getByRole('button', { name: 'code' });
		expect(codeButton).toHaveAttribute('aria-pressed', 'false');

		fireEvent.click(codeButton);

		expect(codeButton).toHaveAttribute('aria-pressed', 'true');
		expect(screen.getByRole('button', { name: 'Resize code editor' })).toBeInTheDocument();
		const editor = await screen.findByRole('textbox', { name: 'Code editor for Textmodifier.rect' });
		expect(editor).toHaveValue("import { textmode } from 'textmode.js';\ntextmode.create();\n");
		expect(screen.getByText('original')).toBeInTheDocument();

		fireEvent.change(editor, {
			target: { value: "import { textmode } from 'textmode.js';\ntextmode.edited();\n" },
		});
		expect(screen.getByText('edited')).toBeInTheDocument();

		fireEvent.click(screen.getByRole('button', { name: 'run' }));
		await waitFor(() => {
			expect(screen.getByTitle('Textmodifier.rect preview')).toHaveAttribute(
				'srcdoc',
				expect.stringContaining('textmode.edited();')
			);
		});

		fireEvent.click(screen.getByRole('button', { name: 'reset' }));
		expect(editor).toHaveValue("import { textmode } from 'textmode.js';\ntextmode.create();\n");
		await waitFor(() => {
			expect(screen.getByTitle('Textmodifier.rect preview')).toHaveAttribute(
				'srcdoc',
				expect.stringContaining('textmode.create();')
			);
		});
	});

	it('shows an accessible source error when code source loading fails', async () => {
		window.history.replaceState(null, '', '/textmode.js/');
		vi.stubGlobal(
			'fetch',
			vi.fn(async (input: RequestInfo | URL) => {
				const url = String(input);
				if (url.endsWith('/textmode.js/manifest.json')) return jsonResponse(textmodeManifest);
				if (url.endsWith('/textmode.js/Textmodifier/rect/sketch.js')) {
					return new Response('nope', { status: 404, statusText: 'Not Found' });
				}
				return mockFetch(input);
			})
		);

		render(<App />);

		await screen.findByRole('heading', { name: 'textmode.js' });
		fireEvent.click(await screen.findByRole('button', { name: 'code' }));

		await waitFor(() => {
			expect(
				screen
					.getAllByRole('alert')
					.some((alert) => alert.textContent === 'Unable to load source. 404 Not Found')
			).toBe(true);
		});
	});

	it('uses instant mobile preview scrolling when reduced motion is requested', async () => {
		mockMatchMedia({ singleColumn: true, reducedMotion: true });
		window.history.replaceState(null, '', '/textmode.js/');

		render(<App />);

		await screen.findByRole('heading', { name: 'textmode.js' });
		fireEvent.click(await screen.findByRole('link', { name: 'circle' }));

		await waitFor(() => {
			expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start', behavior: 'auto' });
		});
	});

	it('renders an accessible not found page', () => {
		window.history.replaceState(null, '', '/unknown-library/');

		render(<App />);

		expect(screen.getByRole('heading', { name: 'Library not found' })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'all libraries' })).toHaveAttribute('href', '/');
	});

	it('renders a manifest loading error', async () => {
		window.history.replaceState(null, '', '/textmode.filters.js/');
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => new Response('nope', { status: 500, statusText: 'Server Error' }))
		);

		render(<App />);

		await waitFor(() => {
			expect(screen.getByRole('status')).toHaveTextContent(/Unable to load examples manifest/);
		});
	});
});

async function mockFetch(input: RequestInfo | URL) {
	const url = String(input);
	if (url.endsWith('/textmode.js/manifest.json')) return jsonResponse(textmodeManifest);
	if (url.endsWith('/textmode.synth.js/manifest.json')) return jsonResponse(synthManifest);
	if (url.endsWith('/textmode.js/Textmodifier/rect/sketch.js')) {
		return textResponse("import { textmode } from 'textmode.js';\ntextmode.create();\n");
	}
	if (url.endsWith('/textmode.js/Textmodifier/circle/sketch.js')) {
		return textResponse("import { textmode } from 'textmode.js';\ntextmode.circle();\n");
	}
	return jsonResponse({ groups: [] });
}

function jsonResponse(value: unknown) {
	return new Response(JSON.stringify(value), {
		status: 200,
		headers: { 'Content-Type': 'application/json' },
	});
}

function textResponse(value: string) {
	return new Response(value, {
		status: 200,
		headers: { 'Content-Type': 'text/javascript' },
	});
}

function mockMatchMedia({ singleColumn, reducedMotion = false }: { singleColumn: boolean; reducedMotion?: boolean }) {
	vi.stubGlobal('matchMedia', (query: string) => {
		const matches = query.includes('max-width: 980px')
			? singleColumn
			: query.includes('prefers-reduced-motion') && reducedMotion;

		return {
			matches,
			media: query,
			onchange: null,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			addListener: vi.fn(),
			removeListener: vi.fn(),
			dispatchEvent: vi.fn(),
		};
	});
}

function isBefore(first: Element, second: Element) {
	return Boolean(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING);
}
