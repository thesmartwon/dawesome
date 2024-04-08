export type AudioInsert = {
  input: AudioNode;
  output: AudioNode;
};
export function connectSerial(nodes: (AudioNode | AudioInsert | undefined)[]) {
  const _nodes = nodes.filter((x): x is AudioNode | AudioInsert => !!x);
  _nodes.reduce((a, b) => {
    const left = "output" in a ? a.output : a;
    const right = "input" in b ? b.input : b;
    left.connect(right);
    return b;
  });

  return () => {
    _nodes.reduce((a, b) => {
      const left = "output" in a ? a.output : a;
      const right = "input" in b ? b.input : b;
      left.disconnect(right);
      return b;
    });
  };
}

export const globalCtx = new AudioContext();
export const globalGain = globalCtx.createGain();
globalGain.gain.value = 50;
export const globalAnalyzer = globalCtx.createAnalyser();
globalAnalyzer.fftSize = 2048;
export let nPlaying = 0;

function createDecayEnvelope(
	context: BaseAudioContext,
	seconds: number
): [AudioNode, (time: number) => number] {
	let stopAt = 0;
	const envelope = context.createGain();
	envelope.gain.value = 1.0;

	function start(time: number): number {
		if (stopAt) return stopAt;
		envelope.gain.cancelScheduledValues(time);
		const envelopeAt = time || context.currentTime;
		stopAt = envelopeAt + seconds;
		envelope.gain.setValueAtTime(1.0, envelopeAt);
		envelope.gain.linearRampToValueAtTime(0, stopAt);

		return stopAt;
	}

	return [envelope, start];
}

type SampleOptions = {
	gain: number;
	detuneCents: number;
	decaySeconds: number;
};

export type Samples ={ [k: string]: AudioBuffer | null };
// Queues samples and plays them.
export class Player {
	samples: Samples = {};
	onLoaded: (name: string, buffer: AudioBuffer) => void = () => {};

	constructor(
		public ctx = globalCtx,
	) {
	}

	async loadUrl(name: string, url: string) {
		if (name in this.samples) return;
		this.samples[name] = null; // loading state
		const response = await fetch(url);
		if (response.status !== 200) throw new Error('Response code ' + response.status);
		const audioData = await response.arrayBuffer();
		const buffer = await this.ctx.decodeAudioData(audioData);
		this.samples[name] = buffer;
		this.onLoaded(name, buffer);
	}

	play(name: string, options?: Partial<SampleOptions>) {
		const opts: SampleOptions = {
			 gain: options?.gain ?? 1,
			 detuneCents: options?.detuneCents ?? 0,
			 decaySeconds: options?.decaySeconds ?? 0.7,
		};
		if (!(name in this.samples)) {
			console.warn('not playing unknown sample', name);
			return;
		}

		const source = this.ctx.createBufferSource();
    source.buffer = this.samples[name];
		source.detune.value = opts.detuneCents;

		const gainNode = this.ctx.createGain();
		gainNode.gain.value = opts.gain;

    const [decay, startDecay] = createDecayEnvelope(this.ctx, opts.decaySeconds);
		const ctx = this.ctx;
		function stop(time?: number) {
			time ??= ctx.currentTime;
			const stopAt = startDecay(time);
			source.stop(stopAt);
		}

		connectSerial([
			source,
			gainNode,
			decay,
			globalGain,
			globalAnalyzer,
			this.ctx.destination,
		]);

		nPlaying++;
		source.start();
		source.onended = () => nPlaying--;

		return stop;
	}
}

