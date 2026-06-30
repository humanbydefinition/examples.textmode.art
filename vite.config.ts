import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [react()],
	server: {
		host: true,
		port: 5180,
	},
	build: {
		outDir: 'dist',
		emptyOutDir: true,
	},
	test: {
		environment: 'jsdom',
		include: ['tests/**/*.test.{ts,tsx}'],
		exclude: ['node_modules/**', '.sources/**', 'dist/**'],
		setupFiles: './tests/setup.ts',
	},
});
