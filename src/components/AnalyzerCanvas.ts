import { AutoResizeCanvas } from './AutoResizeCanvas';
import { globalAnalyzer } from '../audio/Player';

export class AnalyzerCanvas extends AutoResizeCanvas {
	dataArray: Uint8Array;

	constructor() {
		super();

		this.dataArray = new Uint8Array(globalAnalyzer.frequencyBinCount);
		requestAnimationFrame(() => this.render());
	}

	render() {
		const ctx = this.ctx();

		ctx.fillStyle = "rgb(200, 200, 200)";
		ctx.fillRect(0, 0, this.width, this.height);

		ctx.lineWidth = 2;
		ctx.strokeStyle = "rgb(0, 0, 0)";
		ctx.beginPath();

		const bufferLength = this.dataArray.length;
		const sliceWidth = (this.width * 1.0) / bufferLength;
		let x = 0;

		globalAnalyzer.getByteTimeDomainData(this.dataArray);
		for (let i = 0; i < bufferLength; i++) {
			const v = this.dataArray[i] / 128.0;
			const y = (v * this.height) / 2;

			if (i === 0) {
				ctx.moveTo(x, y);
			} else {
				ctx.lineTo(x, y);
			}

			x += sliceWidth;
		}

		ctx.lineTo(this.width, this.height / 2);
		ctx.stroke();

		requestAnimationFrame(() => this.render());
	}
}

customElements.define('daw-analyzer', AnalyzerCanvas, { extends: 'canvas' });
