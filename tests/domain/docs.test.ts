import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { getDefaultLibraryDocsHref, getExampleDocsHref, getLibraryDocsHref } from '../../src/domain/docs';
import { flattenGroups, normalizeManifest } from '../../src/domain/manifest';
import { registry } from '../../src/domain/registry';
import type { ExampleManifest, NormalizedLibrary } from '../../src/domain/types';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

describe('docs links', () => {
	it('builds library API landing links', () => {
		expect(getDefaultLibraryDocsHref('textmode.synth.js')).toBe('https://code.textmode.art/api/textmode.synth.js/');

		for (const library of registry.libraries) {
			expect(getLibraryDocsHref(library)).toBe(`https://code.textmode.art/api/${library.name}/`);
		}
	});

	it('resolves representative example API links', () => {
		expect(exampleDocs('textmode.js', 'Textmodifier.rect')).toBe(
			'https://code.textmode.art/api/textmode.js/classes/Textmodifier#rect'
		);
		expect(exampleDocs('textmode.js', 'LayerManager.add')).toBe(
			'https://code.textmode.art/api/textmode.js/namespaces/layering/classes/TextmodeLayerManager#add'
		);
		expect(exampleDocs('textmode.synth.js', 'SynthSource.osc')).toBe(
			'https://code.textmode.art/api/textmode.synth.js/functions/osc'
		);
		expect(exampleDocs('textmode.synth.js', 'SynthSource.brightness')).toBe(
			'https://code.textmode.art/api/textmode.synth.js/classes/SynthSource#brightness'
		);
		expect(exampleDocs('textmode.filters.js', 'FiltersPlugin.brightness')).toBe(
			'https://code.textmode.art/api/textmode.filters.js/variables/FiltersPlugin'
		);
		expect(exampleDocs('textmode.export.js', 'ExportPlugin.init')).toBe(
			'https://code.textmode.art/api/textmode.export.js/variables/ExportPlugin'
		);
		expect(exampleDocs('textmode.figlet.js', 'Textmodifier.loadFigFont')).toBe(
			'https://code.textmode.art/api/textmode.figlet.js/interfaces/TextmodifierFigletExtensions#loadfigfont'
		);
		expect(exampleDocs('textmode.figlet.js', 'TextmodeFigFont.measureText')).toBe(
			'https://code.textmode.art/api/textmode.figlet.js/classes/TextmodeFigFont#measuretext'
		);
	});

	it('uses owner pages for conceptual examples and library landings for unknown examples', () => {
		expect(exampleDocs('textmode.js', 'Textmode.creation')).toBe(
			'https://code.textmode.art/api/textmode.js/classes/textmode'
		);
		expect(exampleDocs('textmode.synth.js', 'UnknownOwner.unknownMember')).toBe(
			'https://code.textmode.art/api/textmode.synth.js/'
		);
	});

	it('adds absolute API docs URLs to every currently synced example', () => {
		for (const library of registry.libraries) {
			const manifestPath = path.join(root, 'public', library.folder, 'manifest.json');
			const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as ExampleManifest;
			const examples = flattenGroups(normalizeManifest(manifest, library));

			expect(examples.length).toBeGreaterThan(0);
			for (const example of examples) {
				expect(example.docsUrl, `${library.name}: ${example.title}`).toMatch(
					/^https:\/\/code\.textmode\.art\/api\//
				);
			}
		}
	});
});

function exampleDocs(libraryName: string, title: string) {
	return getExampleDocsHref(getLibrary(libraryName), { title });
}

function getLibrary(libraryName: string): NormalizedLibrary {
	const library = registry.libraries.find((entry) => entry.name === libraryName);
	if (!library) throw new Error(`Missing test library: ${libraryName}`);
	return library;
}
