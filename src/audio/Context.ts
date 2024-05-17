// Use a global context.
// This means the analyzer will always output what the user expects.
// The biggest downside is that sources cannot be individually recorded.
export class Context {
	gain: GainNode;
	analyzer: AnalyserNode;
	nPlaying = 0;

	constructor(
		public ctx = new AudioContext(),
	) {
		this.gain = ctx.createGain();
		this.gain.gain.value = .5;
		this.analyzer = ctx.createAnalyser();
		ctx.suspend();
	}

	play(source: AudioScheduledSourceNode, effect?: AudioNode) {
		this.nPlaying += 1;

		connect([source, effect, this.gain, this.analyzer, this.ctx.destination]);

		source.onended = () => {
			this.nPlaying -= 1;
			if (this.nPlaying == 0) this.ctx.suspend();
		};
		this.ctx.resume();
		source.start();
	}
}

function connect(nodes: (AudioNode | undefined)[]) {
	(nodes.filter(Boolean) as AudioNode[])
		.reduce((a, b) => a.connect(b));
}
