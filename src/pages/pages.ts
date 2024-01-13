import type { Settings } from '../settings.js';
export const pages = {
	"/": () => import('./index.js'),
	"/instruments": () => import('./instruments.js'),
	"/sequencer": () => import('./sequencer.js'),
	"/settings": () => import('./settings.js'),
};
export type PageProps = {
	index: Index;
	settings: Settings;
};
