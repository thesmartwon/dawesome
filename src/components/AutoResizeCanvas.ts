import { debounce } from '../Helpers';

export class AutoResizeCanvas {
	constructor(
		public canvas: HTMLCanvasElement,
	) {
		new ResizeObserver(debounce(() => this.onResize())).observe(canvas);
	}

	onResize() {
		const { canvas } = this;
		const { width, height } = canvas.getBoundingClientRect();
		canvas.width = width;
		canvas.height = height;
	}
}
