import type { Samples } from './smplr/sampler.js'

export type Category =
	| 'percussion'
	| 'strings'
	| 'wind'
	| 'electronic';

export type Index = {
	[category: string]: {
		[sample: string]: string[];
	}
};

export type UserIndex = {
	[name: string]: Samples
};

declare global {
	interface Window { dragBuffer: AudioBuffer; }
}

