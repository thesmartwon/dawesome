import { AutoResizeCanvas } from './AutoResizeCanvas';

export class AnalyzerCanvas extends AutoResizeCanvas {
	static observedAttributes = ['nPlaying', ...super.observedAttributes];

	dataArray = new Uint8Array();
	_node?: AnalyserNode;
	_nPlaying = 0;

	set node(n: AnalyserNode) {
		this._node = n;
		this.dataArray = new Uint8Array(n.frequencyBinCount);
	}

	set nPlaying(n: number) {
		this._nPlaying = n;
		this.raf();
	}

	render() {
		const ctx = this.ctx();
		const { width, height } = ctx.canvas;

		ctx.fillStyle = "rgb(200, 200, 200)";
		ctx.fillRect(0, 0, width, height);

		ctx.lineWidth = 2;
		ctx.strokeStyle = "rgb(0, 0, 0)";
		ctx.beginPath();

		ctx.moveTo(0, height / 2);

		const bufferLength = this.dataArray.length;
		const sliceWidth = (width * 1.0) / bufferLength;
		let x = 0;

		this._node?.getByteTimeDomainData(this.dataArray);
		for (let i = 0; i < bufferLength; i++) {
			const v = this.dataArray[i] - 128;
			const y = height / 2 + (v / 128 * height * .5);

			ctx.lineTo(x, y);

			x += sliceWidth;
		}

		ctx.lineTo(width, height / 2);
		ctx.stroke();

		if (this._nPlaying > 0) this.raf();
	}
}

customElements.define('daw-analyzer', AnalyzerCanvas);
