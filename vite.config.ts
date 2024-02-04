import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
	plugins: [
		solidPlugin(),
	],
	server: {
		port: 3000,
	},
	build: {
		target: 'esnext',
	},
	define: {
		SAMPLE_BASE: JSON.stringify('http://localhost:8888'),
	}
});
