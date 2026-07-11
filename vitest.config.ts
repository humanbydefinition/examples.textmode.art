import { defineTextmodeProject } from '@textmode/vitest-config';

export default defineTextmodeProject({
	setupFiles: ['./tests/setup.ts'],
	projects: [
		{
			test: {
				name: 'unit',
				include: ['tests/**/*.test.{ts,tsx}'],
				exclude: ['node_modules/**', '.sources/**', 'dist/**'],
			},
		},
	],
});
