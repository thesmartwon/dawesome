import { OutputChannel } from "../player/channel";
import { DefaultPlayer, DefaultPlayerConfig } from "../player/default-player";
import { AudioBuffers, loadAudioBuffer } from "../player/load-audio";
import { SampleStart, SampleStop } from "../player/types";
import { Storage } from "../storage";

type DrumMachineConfig = {
	url: string;
	files: string[];
	storage: Storage;
};

export type DrumMachineOptions = DrumMachineConfig & Partial<DefaultPlayerConfig>;
export type Variations = { [k: string]: string[] };

export class DrumMachine {
	private variations: Variations;
	player: DefaultPlayer;
	public readonly load: Promise<this>;
	public readonly output: OutputChannel;
	name: string;
	category = 'percussion';

	public constructor(context: AudioContext, options: DrumMachineOptions) {
		this.name = options.url.split('/').pop() as string;
		this.variations = options.files.reduce((acc, cur) => {
			const split = cur.split('-');
			const name = split[0];
			let adjective = split[1] ?? '';
			let variation = split[2] ?? '';
			if (split.length == 2 && /^\d+$/.test(split[1])) {
				adjective = '';
				variation = split[1];
			}
			const key = `${name}${adjective ? '-' + adjective : ''}`;
			acc[key] = acc[key] || [];
			acc[key].push(`${key}${variation ? '-' + variation : ''}`);
			return acc;
		}, {} as Variations);

		this.player = new DefaultPlayer(context, options);
		this.output = this.player.output;
		this.load = drumMachineLoader(
			context,
			this.player.buffers,
			options
		).then(() => this);
	}

	get sampleNames(): string[] {
		return Object.keys(this.variations);
	}

	getVariations(name: string): string[] {
		return this.variations[name] ?? [];
	}

	start(sample: SampleStart) {
		return this.player.start({
			...sample,
			note: sample.note,
			stopId: sample.stopId ?? sample.note,
		});
	}

	stop(sample: SampleStop) {
		return this.player.stop(sample);
	}
}

async function drumMachineLoader(
	context: BaseAudioContext,
	buffers: AudioBuffers,
	options: DrumMachineOptions,
) {
	const format = "ogg";
	return Promise.all(
		options.files.map(async (sample) => {
			const url = `${options.url}/${sample}.${format}`;
			const buffer = await loadAudioBuffer(context, url, options.storage);
			if (buffer) buffers[sample] = buffer;
		})
	);
}
