import { AutoResizeCanvas } from './AutoResizeCanvas';
import { Piano, Key, NoteDownEvent, NoteUpEvent } from './Piano';

export class DisplayKey extends Key {
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

export class PianoPlayed extends AutoResizeCanvas {
	static observedAttributes = ['speed', ...super.observedAttributes];
	// Percent per second
	speed = 0.2;

	keys: DisplayKey[] = [];

	_piano?: Piano;
	cleanup = () => {};

	set piano(p: Piano | undefined) {
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

	disconnectedCallback() {
		this.cleanup();
	}

	attributeChangedCallback(prop: string, _old: string | number, value: string | number) {
		if (prop == 'speed') this.speed = +value;
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
		this.dirty = true;
	}

	onNoteUp(note: string) {
		const collection = this.keys;
		for (let i = 0; i < collection.length; i++) {
			if (collection[i].note == note && collection[i].isDown == true) {
				collection[i].isDown = false;
				break;
			}
		}
		this.dirty = true;
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

	render(time: DOMHighResTimeStamp) {
		const dt = (time - this.prevTime) / 1000;
		const ctx = this.ctx();

		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

		for (let i = 0; i < this.keys.length; i++) {
			this.keys[i].y -= this.speed * dt;
			if (this.keys[i].isDown) this.keys[i].height += this.speed * dt;
			if (this.keys[i].y + this.keys[i].height < 0) this.keys.splice(i--, 1);
		}

		for (let i = 0; i < this.keys.length; i++) this.renderKey(this.keys[i]);

		this.dirty = this.keys.length > 0;
	}
}

customElements.define('daw-piano-played', PianoPlayed);
