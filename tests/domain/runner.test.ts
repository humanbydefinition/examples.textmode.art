import { describe, expect, it } from 'vitest';
import { normalizeRegistry } from '../../src/domain/registry';
import { createExampleRunnerDocument, transformExampleModule } from '../../src/domain/runner';

const registry = normalizeRegistry({
	libraries: [
		{
			name: 'textmode.js',
			repo: 'textmode.js',
			folder: 'textmode.js',
			bundle: 'dist/textmode.esm.js',
			github: 'humanbydefinition/textmode.js',
			license: 'MIT',
			source: { repository: 'humanbydefinition/textmode.js' },
		},
	],
});

const library = registry.libraries[0];

describe('example runner', () => {
	it('keeps bare library imports and emits the vendor import map', async () => {
		const html = await createExampleRunnerDocument({
			code: "import { textmode } from 'textmode.js';\ntextmode.create();",
			examplePath: 'Textmode/create',
			library,
			registry,
		});

		expect(html).toContain('"textmode.js": "/vendor/textmode.js/index.js"');
		expect(html).toContain("import { textmode } from 'textmode.js';");
		expect(html).toContain('<base href="/textmode.js/Textmode/create/" />');
		expect(html).toContain('overflow: hidden;');
		expect(html).toContain('canvas {');
	});

	it('runs global-style sketches as classic scripts after installing textmode globals', async () => {
		const html = await createExampleRunnerDocument({
			code: 'const t = textmode.create();\ntextmode.setErrorLevel(TextmodeErrorLevel.WARNING);',
			examplePath: 'Textmode/create',
			library,
			registry,
		});

		expect(html).toContain("import * as __textmodeModule from 'textmode.js';");
		expect(html).toContain('window.textmode = __textmodeModule.textmode;');
		expect(html).toContain("document.createElement('script')");
		expect(html).toContain('const t = textmode.create();');
		expect(html).not.toContain('const textmode = window.textmode;');
	});

	it('rewrites extensionless relative JavaScript imports to absolute module URLs', async () => {
		const code = await transformExampleModule({
			code: "import { RectangleManager } from './RectangleManager';\nconsole.log(RectangleManager);",
			examplePath: 'textmodeshift',
			libraryFolder: 'textmode.js',
		});

		expect(code).toContain("from '/textmode.js/textmodeshift/RectangleManager.js'");
	});

	it('rewrites shader/text imports to data modules', async () => {
		const code = await transformExampleModule({
			code: "import NoiseFragShader from './noise.frag';\nconsole.log(NoiseFragShader);",
			examplePath: 'textmodeshift',
			libraryFolder: 'textmode.js',
			loadText: async (url) => {
				expect(url).toBe('/textmode.js/textmodeshift/noise.frag');
				return 'void main() {}';
			},
		});

		expect(code).toContain('data:text/javascript;charset=utf-8');
		expect(decodeURIComponent(code)).toContain('export default "void main() {}";');
	});

	it('rejects invalid example paths', async () => {
		await expect(
			transformExampleModule({
				code: 'console.log(1);',
				examplePath: '../escape',
				libraryFolder: 'textmode.js',
			})
		).rejects.toThrow(/Invalid example path/);
	});
});
