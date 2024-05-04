import { debounce } from '../Helpers';

export class AutoResizeCanvas extends HTMLElement {
	static observedAttributes = ['rotate', 'width', 'height'];

	rotate = false;
	canvas = document.createElement('canvas');
	prevTime: DOMHighResTimeStamp = performance.now();

	#dirty = false;
	animationFrame = 0;

	get dirty() {
		return this.#dirty;
	}

	set dirty(val: boolean) {
		const wasDirty = this.#dirty;
		this.#dirty = val;
		if (val && !wasDirty) {
			this.prevTime = performance.now();
			cancelAnimationFrame(this.animationFrame);
			this.raf();
		}
	}

	connectedCallback() {
		this.appendChild(this.canvas);

		new ResizeObserver(debounce(this.onResize.bind(this))).observe(this);
		this.prevTime = performance.now();
		this.raf();
	}

	onResize(entries: ResizeObserverEntry[]) {
		const { width, height } = entries[0].contentRect;
		this.canvas.width = this.rotate ? height : width;
		this.canvas.height = this.rotate ? width : height;
		this.raf();
	}

	ctx() {
		const res = this.canvas.getContext('2d');
		if (!res) throw new Error('2d context not supported');
		return res;
	}

	attributeChangedCallback(name: string, _old: string, value: string) {
		if (name === 'rotate') this.rotate = value == 'true';
		else if (name == 'height') this.canvas.height = +value;
		else if (name == 'width') this.canvas.width = +value;
		else if (name in this) (this as any)[name] = value;
		this.dirty = true;
	}

	render(_time: DOMHighResTimeStamp) {}

	raf() {
		this.animationFrame = requestAnimationFrame(time => {
			this.render(time);
			this.prevTime = time;
			if (this.dirty) this.raf();
		});
	}
}
