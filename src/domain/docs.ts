import type { NormalizedExample, NormalizedLibrary } from './types';

export const DOCS_ORIGIN = 'https://code.textmode.art';

interface OwnerDocsTarget {
	route: string;
	memberAnchors?: boolean;
}

type OwnerDocsMap = Record<string, OwnerDocsTarget>;

const OWNER_DOCS: Record<string, OwnerDocsMap> = {
	'textmode.js': {
		LayerManager: { route: '/api/textmode.js/namespaces/layering/classes/TextmodeLayerManager' },
		Textmode: { route: '/api/textmode.js/classes/textmode' },
		TextmodeColor: { route: '/api/textmode.js/namespaces/color/classes/TextmodeColor' },
		TextmodeGlyphRamp: { route: '/api/textmode.js/classes/TextmodeGlyphRamp' },
		TextmodeFont: { route: '/api/textmode.js/namespaces/fonts/classes/TextmodeFont' },
		TextmodeTileset: { route: '/api/textmode.js/namespaces/fonts/classes/TextmodeTileset' },
		TextmodeImage: { route: '/api/textmode.js/namespaces/media/classes/TextmodeImage' },
		TextmodeCamera: { route: '/api/textmode.js/classes/TextmodeCamera' },
		TextmodeGrid: { route: '/api/textmode.js/classes/TextmodeGrid' },
		TextmodeLayer: { route: '/api/textmode.js/namespaces/layering/classes/TextmodeLayer' },
		TextmodeFramebuffer: { route: '/api/textmode.js/classes/TextmodeFramebuffer' },
		TextmodeShader: { route: '/api/textmode.js/classes/TextmodeShader' },
		TextmodeSource: { route: '/api/textmode.js/namespaces/media/classes/TextmodeSource' },
		TextmodeTexture: { route: '/api/textmode.js/namespaces/media/classes/TextmodeTexture' },
		TextmodeVideo: { route: '/api/textmode.js/namespaces/media/classes/TextmodeVideo' },
		conversion: { route: '/api/textmode.js/namespaces/conversion' },
		filters: { route: '/api/textmode.js/namespaces/filters' },
		plugins: { route: '/api/textmode.js/namespaces/plugins' },
		Textmodifier: { route: '/api/textmode.js/classes/Textmodifier' },
	},
	'textmode.synth.js': {
		SynthSource: { route: '/api/textmode.synth.js/classes/SynthSource' },
		cellColor: { route: '/api/textmode.synth.js/functions/cellColor', memberAnchors: false },
		charColor: { route: '/api/textmode.synth.js/functions/charColor', memberAnchors: false },
		char: { route: '/api/textmode.synth.js/functions/char', memberAnchors: false },
		paint: { route: '/api/textmode.synth.js/functions/paint', memberAnchors: false },
		ModulatedArray: { route: '/api/textmode.synth.js/interfaces/ModulatedArray' },
		EasingFunction: { route: '/api/textmode.synth.js/type-aliases/EasingFunction', memberAnchors: false },
	},
	'textmode.filters.js': {
		FiltersPlugin: { route: '/api/textmode.filters.js/variables/FiltersPlugin', memberAnchors: false },
	},
	'textmode.export.js': {
		ExportPlugin: { route: '/api/textmode.export.js/variables/ExportPlugin', memberAnchors: false },
	},
	'textmode.figlet.js': {
		Textmodifier: { route: '/api/textmode.figlet.js/interfaces/TextmodifierFigletExtensions' },
		FigletPlugin: { route: '/api/textmode.figlet.js/variables/FigletPlugin', memberAnchors: false },
		TextmodeFigFont: { route: '/api/textmode.figlet.js/classes/TextmodeFigFont' },
	},
};

const EXAMPLE_DOCS_OVERRIDES: Record<string, Record<string, string>> = {
	'textmode.js': {
		'Textmode.creation': '/api/textmode.js/classes/textmode',
		'TextmodeColor.creation': '/api/textmode.js/namespaces/color/classes/TextmodeColor',
		'TextmodeGlyphRamp.creation': '/api/textmode.js/classes/TextmodeGlyphRamp',
		'TextmodeFont.creation': '/api/textmode.js/namespaces/fonts/classes/TextmodeFont',
		'TextmodeTileset.creation': '/api/textmode.js/namespaces/fonts/classes/TextmodeTileset',
		'TextmodeImage.creation': '/api/textmode.js/namespaces/media/classes/TextmodeImage',
		'TextmodeGrid.creation': '/api/textmode.js/classes/TextmodeGrid',
		'TextmodeVideo.creation': '/api/textmode.js/namespaces/media/classes/TextmodeVideo',
	},
	'textmode.synth.js': {
		'SynthSource.osc': '/api/textmode.synth.js/functions/osc',
		'SynthSource.noise': '/api/textmode.synth.js/functions/noise',
		'SynthSource.gradient': '/api/textmode.synth.js/functions/gradient',
		'SynthSource.plasma': '/api/textmode.synth.js/functions/plasma',
		'SynthSource.moire': '/api/textmode.synth.js/functions/moire',
		'SynthSource.voronoi': '/api/textmode.synth.js/functions/voronoi',
		'SynthSource.shape': '/api/textmode.synth.js/functions/shape',
		'SynthSource.solid': '/api/textmode.synth.js/functions/solid',
		'SynthSource.solid2': '/api/textmode.synth.js/functions/solid',
		'SynthSource.src': '/api/textmode.synth.js/functions/src',
	},
};

export function getDefaultLibraryDocsHref(libraryName: string): string {
	return `${DOCS_ORIGIN}/api/${libraryName}/`;
}

export function getLibraryDocsHref(library: Pick<NormalizedLibrary, 'name' | 'docsUrl'>): string {
	return library.docsUrl || getDefaultLibraryDocsHref(library.name);
}

export function getExampleDocsHref(
	library: Pick<NormalizedLibrary, 'name' | 'docsUrl'>,
	example: Pick<NormalizedExample, 'title'>
): string {
	const fallback = getLibraryDocsHref(library);
	const override = EXAMPLE_DOCS_OVERRIDES[library.name]?.[example.title];
	if (override) return toAbsoluteDocsHref(override);

	const [owner, member] = example.title.split('.');
	const ownerTarget = owner ? OWNER_DOCS[library.name]?.[owner] : undefined;
	if (!ownerTarget) return fallback;
	if (!member || member === 'creation' || ownerTarget.memberAnchors === false) {
		return toAbsoluteDocsHref(ownerTarget.route);
	}

	return toAbsoluteDocsHref(`${ownerTarget.route}#${getMemberAnchor(member)}`);
}

function getMemberAnchor(member: string): string {
	return member.toLowerCase();
}

function toAbsoluteDocsHref(route: string): string {
	return new URL(route, DOCS_ORIGIN).href;
}
