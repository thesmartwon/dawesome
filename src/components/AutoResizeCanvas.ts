import { debounce } from '../Helpers';

export class AutoResizeCanvas extends HTMLCanvasElement {
	constructor() {
		super();
		new ResizeObserver(debounce(() => this.onResize())).observe(this);
	}

	onResize() {
		const { width, height } = this.getBoundingClientRect();
		this.width = width;
		this.height = height;
	}

	ctx() {
		const res = this.getContext('2d');
		if (!res) throw new Error('2d context not supported');
		return res;
	}
}
