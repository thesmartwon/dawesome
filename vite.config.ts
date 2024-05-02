import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
	plugins: [
		solidPlugin(),
		// hot reloading web components is ghetto
		{
			name: 'no-hmr',
			handleHotUpdate({ server }) {
				server.ws.send({ type: 'full-reload' });
				return [];
			}
		},
	],
	server: {
		port: 3000,
	},
	build: {
		target: 'esnext',
	},
	define: {
		SAMPLE_BASE: JSON.stringify('https://samples.dawesome.io'),
	},
});
