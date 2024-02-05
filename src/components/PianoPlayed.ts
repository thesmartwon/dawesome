import { AutoResizeCanvas } from './AutoResizeCanvas';
import { Piano, Key, NoteDownEvent, NoteUpEvent } from './Piano';

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

export class PianoDisplay extends AutoResizeCanvas {
	// Percent per second
	speed = 0.2;
	prevTime: DOMHighResTimeStamp = performance.now();

	keys: DisplayKey[] = [];

	_piano?: Piano;
	cleanup = () => {};

	set piano(p: Piano) {
		this._piano = p;
		this.keys = [];
		const noteDown = (ev: NoteDownEvent) => {
			const { note, velocity } = ev.detail;
			this.onNoteDown(note, velocity);
		};
		const noteUp = (ev: NoteUpEvent) => {
			const { note } = ev.detail;
			this.onNoteUp(note);
		};
		this.cleanup();
		p.addEventListener('notedown', noteDown);
		p.addEventListener('noteup', noteUp);
		this.cleanup = () => {
			p.removeEventListener('notedown', noteDown);
			p.removeEventListener('noteup', noteUp);
		};
	}

	connectedCallback() {
		this.prevTime = performance.now();
		this.render();
	}

	onNoteDown(note: string, velocity: number) {
		if (!this._piano) return;
		const isWhite = note[1] != '#';

		const collection = isWhite ? this._piano.whiteKeys : this._piano.blackKeys;

		for (let i = 0; i < collection.length; i++) {
			if (collection[i].note == note) {
				this.keys.push(DisplayKey.fromKey(collection[i], velocity));
				break;
			}
		}
	}

	onNoteUp(note: string) {
		const collection = this.keys;
		for (let i = 0; i < collection.length; i++) {
			if (collection[i].note == note && collection[i].isDown == true) {
				collection[i].isDown = false;
				break;
			}
		}
	}

	private renderKey(key: Key) {
		if (!this._piano) return;

		const ctx = this.ctx();
		const isWhite = key.note[1] != '#';

		let { x, y, width, height, isDown } = key;
		x += this._piano.offsetX;
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
		const ctx = this.ctx();
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

customElements.define('daw-piano-played', PianoDisplay, { extends: 'canvas' });
