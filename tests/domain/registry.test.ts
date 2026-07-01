import { describe, expect, it } from 'vitest';
import { getDefaultLibraryDocsHref } from '../../src/domain/docs';
import { normalizeRegistry, validateLibraryConfig } from '../../src/domain/registry';

describe('registry', () => {
	it('applies site and docs defaults', () => {
		const registry = normalizeRegistry({
			libraries: [
				{
					name: 'textmode.test.js',
					repo: 'textmode.test.js',
					folder: 'textmode.test.js',
					bundle: 'dist/index.js',
					github: 'humanbydefinition/textmode.test.js',
					license: 'MIT',
					source: { repository: 'humanbydefinition/textmode.test.js' },
				},
			],
		});

		expect(registry.site.title).toBe('examples.textmode.art');
		expect(registry.libraries[0].docsUrl).toBe(getDefaultLibraryDocsHref('textmode.test.js'));
	});

	it('reports missing required fields', () => {
		expect(validateLibraryConfig({ name: 'missing' })).toEqual([
			'repo',
			'folder',
			'bundle',
			'github',
			'license',
			'source.repository',
		]);
	});
});
