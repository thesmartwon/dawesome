import { AutoResizeCanvas } from './AutoResizeCanvas';
import { PianoCanvas, Key, getContext } from './PianoCanvas';

class DisplayKey extends Key {
	constructor(
		public x: number,
		public y: number,
		public width: number,
		public height: number,
		public note: string,
		public velocity: number
	) {
		super(x, y, width, height, note, true);
	}

	static fromKey(key: Key, velocity: number): DisplayKey {
		return new DisplayKey(key.x, 1, key.width, 0, key.note, velocity);
	}
}

export class PianoDisplayCanvas extends AutoResizeCanvas {
	// Percent per second
	speed = 0.2;
	prevTime: DOMHighResTimeStamp;

	keys: DisplayKey[] = [];

	constructor(
		public canvas: HTMLCanvasElement,
		public pianoCanvas: PianoCanvas,
	) {
		super(canvas);

		this.prevTime = performance.now();
		this.render();
	}

	playNote(note: string, velocity: number) {
		const isWhite = note[1] != '#';

		const collection = isWhite ? this.pianoCanvas.whiteKeys : this.pianoCanvas.blackKeys;

		for (let i = 0; i < collection.length; i++) {
			if (collection[i].note == note) {
				this.keys.push(DisplayKey.fromKey(collection[i], velocity));
				break;
			}
		}
	}

	stopNote(note: string) {
		const collection = this.keys;
		for (let i = 0; i < collection.length; i++) {
			if (collection[i].note == note && collection[i].isDown == true) {
				collection[i].isDown = false;
				break;
			}
		}
	}

	private renderKey(key: Key) {
		const ctx = getContext(this.canvas);
		const isWhite = key.note[1] != '#';

		let { x, y, width, height, isDown } = key;
		x += this.pianoCanvas.offsetX;
		if (x + width < 0 || x > ctx.canvas.width) return;

		ctx.fillStyle = isWhite ? 'white' : 'black';
		if (isDown) ctx.fillStyle = 'gray';

		height = ctx.canvas.height * height;
		y = ctx.canvas.height * y;
		ctx.fillRect(x, y, width, height);
		ctx.strokeRect(x, y, width, height);
	}

	private renderKeys(time: DOMHighResTimeStamp) {
		const dt = (time - this.prevTime) / 1000;
		const ctx = getContext(this.canvas);
		if (ctx.canvas.width == 0 || ctx.canvas.height == 0) return;

		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

		for (let i = 0; i < this.keys.length; i++) {
			this.keys[i].y -= this.speed * dt;
			if (this.keys[i].isDown) this.keys[i].height += this.speed * dt;
			if (this.keys[i].y + this.keys[i].height < 0) this.keys.splice(i--, 1);
		}

		for (let i = 0; i < this.keys.length; i++) this.renderKey(this.keys[i]);

		this.prevTime = time;

		this.render();
	}

	render() {
		requestAnimationFrame(this.renderKeys.bind(this));
	}
}
