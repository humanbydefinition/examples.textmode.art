import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../../src/ui/App';

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
		expect(
			screen.getAllByRole('link').find((link) => link.getAttribute('href') === '/textmode.js/')
		).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.getByLabelText('2 examples')).toHaveTextContent('2');
		});
	});

	it('renders a library page, filters entries, and opens and closes a preview', async () => {
		window.history.replaceState(null, '', '/textmode.js/');

		render(<App />);

		await screen.findByRole('heading', { name: 'textmode.js' });
		expect(screen.getByRole('link', { name: 'docs' })).toHaveAttribute(
			'href',
			'https://code.textmode.art/api/textmode.js/'
		);

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
		expect(screen.getByTitle('Textmodifier.rect preview')).toHaveAttribute(
			'src',
			'/textmode.js/sketch.html?path=Textmodifier%2Frect'
		);
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
		expect(document.querySelector('.preview-actions')?.textContent).toBe('docssourceopenclose');

		fireEvent.change(screen.getByLabelText('Filter examples'), { target: { value: 'circle' } });

		expect(screen.queryByRole('link', { name: 'rect' })).not.toBeInTheDocument();
		const circle = screen.getByRole('link', { name: 'circle' });
		fireEvent.click(circle);

		expect(circle).toHaveAttribute('aria-current', 'true');
		expect(window.location.hash).toBe('#Textmodifier%2Fcircle');
		expect(scrollIntoView).not.toHaveBeenCalled();

		fireEvent.click(screen.getByRole('button', { name: 'close' }));

		expect(screen.getAllByText('No sketch selected')).toHaveLength(2);
		expect(screen.queryByRole('link', { name: /Open API docs for/ })).not.toBeInTheDocument();
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
				'src',
				'/textmode.js/sketch.html?path=Textmodifier%2Fcircle'
			);
			expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start', behavior: 'smooth' });
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
	return jsonResponse({ groups: [] });
}

function jsonResponse(value: unknown) {
	return new Response(JSON.stringify(value), {
		status: 200,
		headers: { 'Content-Type': 'application/json' },
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
