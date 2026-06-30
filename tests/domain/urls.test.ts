import { describe, expect, it } from 'vitest';
import { getExampleHref, getExampleSourceHref, getLibraryHref } from '../../src/domain/urls';
import type { NormalizedLibrary } from '../../src/domain/types';

const library = {
	name: 'textmode.test.js',
	folder: 'textmode.test.js',
	docsUrl: 'https://code.textmode.art',
} as NormalizedLibrary;

describe('urls', () => {
	it('builds route and sketch urls', () => {
		expect(getLibraryHref(library)).toBe('/textmode.test.js/');
		expect(getExampleHref(library, 'Group/example name')).toBe(
			'/textmode.test.js/sketch.html?path=Group%2Fexample%20name'
		);
		expect(getExampleSourceHref(library, 'Group/example')).toBe('/textmode.test.js/Group/example/sketch.js');
	});
});
