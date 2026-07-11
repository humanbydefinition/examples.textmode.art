import { defineConfig } from 'eslint/config';
import textmodeEslintConfig from '@textmode/eslint-config';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';

export default defineConfig(
	{ ignores: ['.sources/**', 'public/**'] },
	...textmodeEslintConfig.map((entry) => {
		if (Array.isArray(entry.files) && entry.files.some((f) => f.includes('src/**/*.{ts,js}'))) {
			return { ...entry, files: ['src/**/*.{ts,tsx,js}'] };
		}
		return entry;
	}),
	{
		files: ['src/**/*.{ts,tsx}'],
		plugins: { 'jsx-a11y': jsxA11y },
		rules: {
			...jsxA11y.configs.recommended.rules,
			'@typescript-eslint/no-explicit-any': 'off',
		},
	},
	{
		files: ['scripts/**/*.{mjs,ts}', 'vite.config.ts', 'vitest.config.ts'],
		languageOptions: { globals: globals.node },
	}
);
