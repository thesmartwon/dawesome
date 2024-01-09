import { DefaultPlayer } from "./player/default-player";
import { AudioBuffersLoader, loadAudioBuffer } from "./player/load-audio";
import { SampleStart, SampleStop } from "./player/types";
import { midiVelToGain } from "./player/volume";
import { HttpStorage, Storage } from "./storage";
import { SampleOptions } from './player/types.js';

export type Sample = {
	name: string;
	url: string;
	buffer?: AudioBuffer;
} & SampleOptions;
export type Samples = Record<string | number, SampleWithBuffer>;

export type SampleWithBuffer = Sample & {
	buffer: AudioBuffer;
};

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
	name: string;
  options: SamplerConfig;
	samples: Samples;
  readonly player: DefaultPlayer;
  readonly load: Promise<this>;

  public constructor(
    public readonly context: AudioContext,
		name: string,
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
		this.name = name;
		this.samples = this.options.samples;
    this.player = new DefaultPlayer(context, this.options);
    const loader = createAudioBuffersLoader(this.options.samples, this.options.storage);
    this.load = loader(context, this.player.buffers).then(() => this);
  }

	id() {
		return this.name;
	}

	rename(oldName: string | number, newName: string | number) {
		this.samples[oldName] = this.samples[newName];
		delete this.samples[oldName];
		this.player.buffers[newName] = this.player.buffers[oldName];
		delete this.player.buffers[oldName];
	}

	add(sample: SampleWithBuffer) {
		this.samples[sample.name] = sample;
		this.player.buffers[sample.name] = sample.buffer;
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

function createAudioBuffersLoader(
  source: Record<string | number, SampleWithBuffer>,
  storage: Storage
): AudioBuffersLoader {
  return async (context, buffers) => {
    await Promise.all([
      Object.keys(source).map(async (key) => {
        const value = source[key];
        if (value.buffer instanceof AudioBuffer) {
          buffers[key] = value.buffer;
        } else if (typeof value.url === "string") {
          const buffer = await loadAudioBuffer(context, value.url, storage);
          if (buffer) buffers[key] = buffer;
        }
      }),
    ]);
  };
}
