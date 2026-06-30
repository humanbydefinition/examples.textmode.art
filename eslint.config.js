import js from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	{
		ignores: ['dist/**', 'node_modules/**', '.sources/**', 'public/**', 'coverage/**'],
	},
	js.configs.recommended,
	...tseslint.configs.recommended,
	{
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
		plugins: {
			'jsx-a11y': jsxA11y,
		},
		rules: {
			...jsxA11y.configs.recommended.rules,
			'@typescript-eslint/no-explicit-any': 'off',
		},
	},
	{
		files: ['scripts/**/*.{mjs,ts}', 'vite.config.ts'],
		languageOptions: {
			globals: globals.node,
		},
	}
);
