import { createSignal } from 'solid-js';
import { Context } from './Context';

export class Sampler {
	samples: { [k: string]: Sample } = {};

	constructor(public ctx: Context) {}

	async loadUrl(name: string, url: string) {
		if (name in this.samples) return;
		this.samples[name] = new Sample();
		const response = await fetch(url);
		if (response.status !== 200) throw new Error('Response code ' + response.status);
		const audioData = await response.arrayBuffer();
		this.samples[name].buffer = await this.ctx.ctx.decodeAudioData(audioData);
	}

	attack(name: string, opts?: AttackOptions) {
		const sample = this.samples[name];
		if (!sample) {
			console.warn('not playing unknown sample', name);
			return;
		}

		const source = sample.createSource(this.ctx, opts);
		this.ctx.play(source);
	}
}

export type AttackOptions = {
	gain?: number,
	detune?: number,
};

export class Sample {
	buffer: AudioBuffer | null = null;
	loaded = createSignal(false);

	createSource(ctx: Context, options?: AttackOptions) {
		const opts = {
			 gain: options?.gain ?? 1,
			 detune: options?.detune ?? 0,
		};
		const source = ctx.ctx.createBufferSource();
		source.buffer = this.buffer;

		const gain = ctx.ctx.createGain();
		gain.gain.value = opts.gain;

		source.connect(gain);

		return source;
	}
}
