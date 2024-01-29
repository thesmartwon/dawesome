import { debounce, clamp } from './Helpers';
import { Note } from 'tonal';

const whiteHeight = 12.2;
const whiteWidth = 2.2;
const blackWidth = 1.5;
const blackHeight = 7.2;

function getContext(canvas: HTMLCanvasElement) {
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('2d context not supported');
	return ctx;
}

class Key {
	constructor(
		public x: number,
		public y: number,
		public width: number,
		public height: number,
		public note: string,
	) {}

	contains(x: number, y: number) {
		return x >= this.x && x <= this.x + this.width &&
				y >= this.y && y <= this.y + this.height;
	}
};

export class Piano {
	dirty = false;
	offsetX = 0;
	virtualWidth = 0;
	virtualMiddle = 0;
	loaded = false;

	whiteKeys: Key[] = [];
	blackKeys: Key[] = [];

	constructor(
		public canvas: HTMLCanvasElement,
		public whiteHeightPx = 350,
		public onKeyDown: (note: string) => void,
		public onKeyUp: (note: string) => void,
	) {
		new ResizeObserver(debounce(() => this.onResize())).observe(canvas);
		canvas.addEventListener('wheel', ev => this.onWheel(ev));
		canvas.addEventListener('mousedown', ev => this.onMouse(ev, onKeyDown));
		canvas.addEventListener('mouseup', ev => this.onMouse(ev, onKeyUp));
	}

	setOffset(n: number) {
		this.offsetX = clamp(n, this.canvas.width - this.virtualWidth, 0);
		// TODO: Find C closest to middle for relative hotkeys.
		this.render();
	}

	private layout() {
		this.virtualWidth = 0;
		this.whiteKeys = [];
		this.blackKeys = [];
		const whiteHeightPx = this.whiteHeightPx;
		const whiteWidthPx = this.whiteHeightPx * whiteWidth / whiteHeight;
		const blackHeightPx = this.whiteHeightPx * blackHeight / whiteHeight;
		const blackWidthPx = this.whiteHeightPx * blackWidth / whiteHeight;

		let y = this.canvas.height - this.whiteHeightPx;
		for (let i = 0; i < 128; i++) {
			const note = Note.fromMidiSharps(i);

			const isWhite = note[1] != '#';
			const width = isWhite ? whiteWidthPx : blackWidthPx;
			const height = isWhite ? whiteHeightPx : blackHeightPx;

			let x = this.virtualWidth;
			if (!isWhite) x -= blackWidthPx / 2;
			const key = new Key(x, y, width, height, note);
			(isWhite ? this.whiteKeys : this.blackKeys).push(key);

			if (i == 60) {
				this.virtualMiddle = this.virtualWidth + whiteWidthPx / 2;
			}
			if (isWhite) {
				this.virtualWidth += whiteWidthPx;
			}
		}
	}

	private onResize() {
		const { canvas } = this;
		const { width, height } = canvas.getBoundingClientRect();
		canvas.width = width;
		canvas.height = height;
		console.log('onResize', width, height);

		this.layout();

		if (!this.loaded) {
			this.setOffset(width / 2 - this.virtualMiddle);
			this.loaded = true;
		}

		this.render();
	}

	private onWheel(ev: WheelEvent) {
		ev.preventDefault();
		const dir = ev.deltaY;
		this.setOffset(this.offsetX - dir);
		this.render();
	}

	private onMouse(ev: MouseEvent, cb: (key: string) => void) {
		ev.preventDefault();
		const x = ev.offsetX - this.offsetX;
		const y = ev.offsetY;
		for (let i = 0; i < this.blackKeys.length; i++) {
			const hitbox = this.blackKeys[i];
			if (hitbox.contains(x, y)) return cb(hitbox.note);
		}
		for (let i = 0; i < this.whiteKeys.length; i++) {
			const hitbox = this.whiteKeys[i];
			if (hitbox.contains(x, y)) return cb(hitbox.note);
		}
	}

	private renderKey(key: Key) {
		const ctx = getContext(this.canvas);
		const isWhite = key.note[1] != '#';

		let { x, y, width, height, note } = key;
		x += this.offsetX;
		ctx.fillStyle = isWhite ? 'white' : 'black';
		ctx.fillRect(x, y, width, height);
		ctx.strokeRect(x, y, width, height);

		y += height * .85;
		ctx.fillStyle = isWhite ? 'black' : 'white';
		ctx.fillText(note, x + width / 2, y, width);
	}

	private renderKeys() {
		const ctx = getContext(this.canvas);
		if (ctx.canvas.width == 0 || ctx.canvas.height == 0) return;

		ctx.strokeStyle = 'gray';
		ctx.font = '14px Arial';
		ctx.textAlign = 'center';

		for (let i = 0; i < this.whiteKeys.length; i++) {
			this.renderKey(this.whiteKeys[i]);
		}
		for (let i = 0; i < this.blackKeys.length; i++) {
			this.renderKey(this.blackKeys[i]);
		}
	}

	render() {
		requestAnimationFrame(() => this.renderKeys());
	}
}
