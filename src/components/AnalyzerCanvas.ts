import { AutoResizeCanvas } from './AutoResizeCanvas';
import { globalAnalyzer, nPlaying } from '../audio/Player';

export class AnalyzerCanvas extends AutoResizeCanvas {
	dataArray: Uint8Array;
	rendered = false;
	container = this.parentElement as HTMLElement;

	constructor() {
		super('parent');

		this.dataArray = new Uint8Array(globalAnalyzer.frequencyBinCount);
		requestAnimationFrame(() => this.render());
	}

	onResize() {
		super.onResize();
		this.rendered = false;
	}

	render() {
		const ctx = this.ctx();

		ctx.fillStyle = "rgb(200, 200, 200)";
		ctx.fillRect(0, 0, this.width, this.height);

		ctx.lineWidth = 2;
		ctx.strokeStyle = "rgb(0, 0, 0)";
		ctx.beginPath();

		ctx.moveTo(0, this.height / 2);

		if (nPlaying != 0 || !this.rendered) {
			const bufferLength = this.dataArray.length;
			const sliceWidth = (this.width * 1.0) / bufferLength;
			let x = 0;

			globalAnalyzer.getByteTimeDomainData(this.dataArray);
			for (let i = 0; i < bufferLength; i++) {
				const v = this.dataArray[i] - 128;
				const y = this.height / 2 + (v / 128 * this.height * .5);

				ctx.lineTo(x, y);

				x += sliceWidth;
			}

			this.rendered = true;
		}

		ctx.lineTo(this.width, this.height / 2);
		ctx.stroke();

		requestAnimationFrame(() => this.render());
	}
}

customElements.define('daw-analyzer', AnalyzerCanvas, { extends: 'canvas' });
