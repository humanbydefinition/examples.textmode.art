import { describe, expect, it } from 'vitest';
import { getExamplePath, isValidExamplePath, normalizeManifest } from '../../src/domain/manifest';
import type { ExampleManifest } from '../../src/domain/types';

describe('manifest normalization', () => {
	it('normalizes direct groups', () => {
		const manifest: ExampleManifest = {
			groups: [
				{
					name: 'Textmodifier',
					description: 'Drawing',
					examples: [{ title: 'Textmodifier.rect', sourceFile: 'examples/Textmodifier/rect/sketch.js' }],
				},
			],
		};

		const groups = normalizeManifest(manifest);

		expect(groups).toHaveLength(1);
		expect(groups[0].entries[0]).toMatchObject({
			name: 'rect',
			path: 'Textmodifier/rect',
			title: 'Textmodifier.rect',
			group: 'Textmodifier',
			subgroup: null,
		});
	});

	it('normalizes subgroup examples', () => {
		const manifest: ExampleManifest = {
			groups: [
				{
					name: 'SynthSource',
					subgroups: [
						{
							name: 'Sources',
							examples: [{ sourceFile: 'examples/SynthSource/osc/sketch.js' }],
						},
					],
				},
			],
		};

		const groups = normalizeManifest(manifest);

		expect(groups[0].subgroups[0].name).toBe('Sources');
		expect(groups[0].entries[0]).toMatchObject({
			name: 'osc',
			title: 'osc',
			subgroup: 'Sources',
		});
	});

	it('rejects invalid source files', () => {
		expect(() => getExamplePath('../nope/sketch.js')).toThrow(/Invalid example source file/);
		expect(() => getExamplePath('examples/../nope/sketch.js')).toThrow(/Invalid example path/);
		expect(isValidExamplePath('Textmodifier/rect')).toBe(true);
		expect(isValidExamplePath('Textmodifier/../rect')).toBe(false);
	});
});
