import { DefaultPlayer } from "./player/default-player";
import { loadAudioBuffer } from "./player/load-audio";
import { SampleStart, SampleStop } from "./player/types";
import { midiVelToGain } from "./player/volume";
import { HttpStorage, Storage } from "./storage";
import { SampleOptions } from './player/types.js';

export type SampleState = 'loading' | 'success' | Error;
export type Sample = {
	name: string;
	url: string;
	state: SampleState;
	onStateChange?: (newState: SampleState) => void;
	buffer?: AudioBuffer;
} & SampleOptions;
export type Samples = Record<string | number, Sample>;

function setSampleState(sample: Sample, state: SampleState) {
	sample.state = state;
	sample.onStateChange && sample.onStateChange(sample.state);
}

export type SamplerConfig = {
	storage: Storage;
	detune: number;
	volume: number;
	velocity: number;
	decayTime?: number;
	lpfCutoffHz?: number;
	destination: AudioNode;

	samples: Samples,
	volumeToGain: (volume: number) => number;
};

/**
 * A Sampler instrument
 *
 * @private
 */
export class Sampler {
	options: SamplerConfig;
	samples: Samples;
	readonly player: DefaultPlayer;

	public constructor(
		public readonly context: AudioContext,
		options: Partial<SamplerConfig> = {}
	) {
		this.options = {
			destination: options.destination ?? context.destination,
			detune: 0,
			volume: options.volume ?? 100,
			velocity: options.velocity ?? 100,
			samples: options.samples ?? {},
			storage: options.storage ?? HttpStorage,
			volumeToGain: options.volumeToGain ?? midiVelToGain,
		};
		this.samples = this.options.samples;
		this.player = new DefaultPlayer(context, this.options);
		this.load();
	}

	rename(oldName: string, newName: string) {
		this.samples[newName] = this.samples[oldName];
		this.samples[newName].name = newName;
		delete this.samples[oldName];
		this.player.buffers[newName] = this.player.buffers[oldName];
		delete this.player.buffers[oldName];
	}

	async loadSample(sample: Sample) {
		if (!(sample.buffer instanceof AudioBuffer)) {
			setSampleState(sample, 'loading');
			try {
				sample.buffer = await loadAudioBuffer(this.player.context, sample.url, this.options.storage);
				setSampleState(sample, 'success');
			} catch (err: any) {
				setSampleState(sample, err as Error);
			}
		}
		this.player.buffers[sample.name] = sample.buffer;
	}

	async load(): Promise<this> {
		return Promise.all([
			Object.values(this.samples).map(s => this.loadSample(s))
		]).then(() => this);
	}

	async add(sample: Sample) {
		if (sample.name === '') sample.name = 'new sample';
		if (sample.name in this.samples) {
			const match = sample.name.match(/\d+$/);
			const namePart = sample.name.substring(0, match?.index ?? sample.name.length);
			const numberPart = match ? +match[0] + 1 : 2;
			console.log('match', namePart, numberPart);
			let newName = `${namePart} ${numberPart}`;
			for (let i = numberPart; newName in this.samples; i++) {
				newName = `${namePart} ${i}`;
			}
			sample.name = newName;
		}
		this.samples[sample.name] = sample;
		await this.loadSample(sample);
	}

	delete(name: string | number) {
		delete this.samples[name];
		delete this.player.buffers[name];
	}

	start(sample: SampleStart) {
		return this.player.start({ ...this.samples[sample.note], ...sample });
	}

	stop(sample?: SampleStop | string | number) {
		return this.player.stop(
			typeof sample === "object"
				? sample
				: sample === undefined ? undefined : { stopId: sample }
		);
	}

	disconnect() {
		return this.player.disconnect();
	}
}

