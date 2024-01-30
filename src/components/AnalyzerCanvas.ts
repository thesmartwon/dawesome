import { debounce } from '../Helpers';
import { getContext } from './PianoCanvas';

export class AnalyzerCanvas {
	bufferLength: number;
	dataArray: Uint8Array;

	constructor(
		public canvas: HTMLCanvasElement,
		public node: AnalyserNode
	) {
		new ResizeObserver(debounce(() => this.onResize())).observe(canvas);

		this.bufferLength = this.node.frequencyBinCount;
		this.dataArray = new Uint8Array(this.bufferLength);
	}

	private onResize() {
		const { canvas } = this;
		const { width, height } = canvas.getBoundingClientRect();
		canvas.width = width;
		canvas.height = height;

		requestAnimationFrame(() => this.render());
	}

	render() {
		const canvas = this.canvas;
		const ctx = getContext(canvas);

		ctx.fillStyle = "rgb(200, 200, 200)";
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		ctx.lineWidth = 2;
		ctx.strokeStyle = "rgb(0, 0, 0)";
		ctx.beginPath();

		const sliceWidth = (canvas.width * 1.0) / this.bufferLength;
		let x = 0;

		this.node.getByteTimeDomainData(this.dataArray);
		for (let i = 0; i < this.bufferLength; i++) {
			const v = this.dataArray[i] / 128.0;
			const y = (v * canvas.height) / 2;

			if (i === 0) {
				ctx.moveTo(x, y);
			} else {
				ctx.lineTo(x, y);
			}

			x += sliceWidth;
		}

		ctx.lineTo(canvas.width, canvas.height / 2);
		ctx.stroke();

		requestAnimationFrame(() => this.render());
	}
}
