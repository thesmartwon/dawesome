import { debounce } from '../Helpers';

export class AutoResizeCanvas extends HTMLCanvasElement {
	static observedAttributes = ['rotate'];

	rotate = false;
	container: HTMLElement;

	constructor(container?: string) {
		super();
		this.container = container === 'parent' ? this.parentElement as HTMLElement : this;
		new ResizeObserver(debounce(() => this.onResize())).observe(this.container);
	}

	onResize() {
		const { width, height } = this.container.getBoundingClientRect();
		this.width = this.rotate ? height : width;
		this.height = this.rotate ? width : height;
	}

	ctx() {
		const res = this.getContext('2d');
		if (!res) throw new Error('2d context not supported');
		return res;
	}

	attributeChangedCallback(name: string, _old: string, value: string) {
		if (name === 'rotate') this.rotate = value == 'true';
	}
}
