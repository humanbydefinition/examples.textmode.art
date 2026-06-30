import { describe, expect, it } from 'vitest';
import { normalizeManifest } from '../../src/domain/manifest';
import { filterExampleGroups } from '../../src/domain/search';
import type { ExampleManifest } from '../../src/domain/types';

const groups = normalizeManifest({
	groups: [
		{
			name: 'Drawing',
			examples: [
				{ title: 'Textmodifier.rect', sourceFile: 'examples/Textmodifier/rect/sketch.js' },
				{ title: 'Textmodifier.circle', sourceFile: 'examples/Textmodifier/circle/sketch.js' },
			],
		},
		{
			name: 'Synthesis',
			subgroups: [
				{
					name: 'Sources',
					examples: [{ title: 'SynthSource.osc', sourceFile: 'examples/SynthSource/osc/sketch.js' }],
				},
			],
		},
	],
} satisfies ExampleManifest);

describe('example search', () => {
	it('filters by title, group, and subgroup', () => {
		expect(filterExampleGroups(groups, 'rect')[0].entries.map((entry) => entry.name)).toEqual(['rect']);
		expect(filterExampleGroups(groups, 'synthesis')[0].entries.map((entry) => entry.name)).toEqual(['osc']);
		expect(filterExampleGroups(groups, 'sources')[0].entries.map((entry) => entry.name)).toEqual(['osc']);
	});

	it('returns all groups for an empty query', () => {
		expect(filterExampleGroups(groups, '')).toBe(groups);
	});
});
