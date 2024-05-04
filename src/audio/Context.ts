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

	play(source: AudioScheduledSourceNode) {
		this.nPlaying += 1;

		source
			.connect(this.gain)
			.connect(this.analyzer)
			.connect(this.ctx.destination);
		source.onended = () => {
			this.nPlaying -= 1;
			if (this.nPlaying == 0) this.ctx.suspend();
		};
		this.ctx.resume();
		source.start();
	}
}
