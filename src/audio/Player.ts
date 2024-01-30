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

// Queues samples and plays them.
export class Player {
	samples: { [k: string]: AudioBuffer } = {};

	constructor(
		public ctx = new AudioContext(),
	) {
	}

	async loadUrl(name: string, url: string) {
		if (name in this.samples) return;
		const response = await fetch(url);
		if (response.status !== 200) throw new Error('Response code ' + response.status);
		const audioData = await response.arrayBuffer();
		const buffer = await this.ctx.decodeAudioData(audioData);
		this.samples[name] = buffer;
	}

	start(name: string, gain: number = 1, cents: number = 0, decayTime: number) {
		if (!(name in this.samples)) {
			console.warn('not playing unknown sample', name);
			return;
		}

		const source = this.ctx.createBufferSource();
    source.buffer = this.samples[name];
		source.detune.value = cents;

		const volume = this.ctx.createGain();
		volume.gain.value = gain;

    // Stop with decay
    const [decay, startDecay] = createDecayEnvelope(this.ctx, decayTime);
		const ctx = this.ctx;
		function stop(time?: number) {
			time ??= ctx.currentTime;
			const stopAt = startDecay(time);
			source.stop(stopAt);
		}

		connectSerial([
			source,
			volume,
			decay,
			this.ctx.destination,
		]),

		source.start();

		return stop;
	}
}

export const globalPlayer = new Player();

function createDecayEnvelope(
	context: BaseAudioContext,
	envelopeTime = 0.2
): [AudioNode, (time: number) => number] {
	let stopAt = 0;
	const envelope = context.createGain();
	envelope.gain.value = 1.0;

	function start(time: number): number {
		if (stopAt) return stopAt;
		envelope.gain.cancelScheduledValues(time);
		const envelopeAt = time || context.currentTime;
		stopAt = envelopeAt + envelopeTime;
		envelope.gain.setValueAtTime(1.0, envelopeAt);
		envelope.gain.linearRampToValueAtTime(0, stopAt);

		return stopAt;
	}

	return [envelope, start];
}
