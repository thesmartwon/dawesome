export class Context {
	gain: GainNode;
	analyzer: AnalyserNode;
	nPlaying = 0;
	sink: AudioNode;

	constructor(
		public ctx = new AudioContext(),
	) {
		this.gain = ctx.createGain();
		this.gain.gain.value = .5;
		this.analyzer = ctx.createAnalyser();
		connect([this.gain, this.analyzer, ctx.destination]);
		this.sink = this.gain;
		ctx.suspend();
	}

	play(source: AudioScheduledSourceNode) {
		this.nPlaying += 1;

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
