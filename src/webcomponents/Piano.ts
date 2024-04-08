import { AutoResizeCanvas } from './AutoResizeCanvas';
import { clamp } from '../Helpers';
import { Note } from 'tonal';

// Ratios.
const whiteHeight = 12.2;
const whiteWidth = 2.2;
const blackWidth = 1.5;
const blackHeight = 7.2;

export const leftRightMap = {
	// left hand
	'Digit1': 'C2',
	'Shift+Digit1': 'C#2',
	'Digit2': 'D2',
	'Shift+Digit2': 'D#2',
	'Digit3': 'E2',
	'Digit4': 'F2',
	'Shift+Digit4': 'F#2',
	'Digit5': 'G2',
	'Shift+Digit5': 'G#2',

	'KeyQ': 'A2',
	'Shift+KeyQ': 'A#2',
	'KeyW': 'B2',
	'KeyE': 'C3',
	'Shift+KeyE': 'C#3',
	'KeyR': 'D3',
	'Shift+KeyR': 'D#3',
	'KeyT': 'E3',

	'KeyA': 'F3',
	'Shift+KeyA': 'F#3',
	'KeyS': 'G3',
	'Shift+KeyS': 'G#3',
	'KeyD': 'A3',
	'Shift+KeyD': 'A#3',
	'KeyF': 'B3',
	'KeyG': 'C4',
	'Shift+KeyG': 'C#4',

	'KeyZ': 'D4',
	'Shift+KeyZ': 'D#4',
	'KeyX': 'E4',
	'KeyC': 'F4',
	'Shift+KeyC': 'F#4',
	'KeyV': 'G4',
	'Shift+KeyV': 'G#4',
	'KeyB': 'A4',
	'Shift+KeyB': 'A#4',

	// right hand
	'Digit6': 'B4',
	'Digit7': 'C5',
	'Shift+Digit7': 'C#5',
	'Digit8': 'D5',
	'Shift+Digit8': 'D#5',
	'Digit9': 'E5',
	'Digit0': 'F5',
	'Shift+Digit0': 'F#5',

	'KeyY': 'G5',
	'Shift+KeyY': 'G#5',
	'KeyU': 'A5',
	'Shift+KeyU': 'A#5',
	'KeyI': 'B5',
	'KeyO': 'C6',
	'Shift+KeyO': 'C#6',
	'KeyP': 'D6',
	'Shift+KeyP': 'D#6',

	'KeyH': 'E6',
	'KeyJ': 'F6',
	'Shift+KeyJ': 'F#6',
	'KeyK': 'G6',
	'Shift+KeyK': 'G#6',
	'KeyL': 'A6',
	'Shift+KeyL': 'A#6',
	'Semicolon': 'B6',

	'KeyN': 'C7',
	'Shift+KeyN': 'C#7',
	'KeyM': 'D7',
	'Shift+KeyM': 'D#7',
	'Comma': 'E7',
	'Period': 'F7',
	'Shift+Period': 'F#7',
	'Slash': 'G7',
	'Shift+Slash': 'G#7',
} as { [k: string]: string };

export class Key {
	constructor(
		public x: number,
		public y: number,
		public width: number,
		public height: number,
		public note: string,
		public isDown = false,
	) {}

	contains(x: number, y: number) {
		return x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height;
	}
};

export type NoteDownEvent = CustomEvent<{ note: string, velocity: number}>;
export type NoteUpEvent = CustomEvent<{ note: string }>;

export class Piano extends AutoResizeCanvas {
	static observedAttributes = ['midi', ...super.observedAttributes];

	offsetX = 0;
	virtualWidth = 0;
	virtualMiddle = 0;
	loaded = false;

	whiteKeys: Key[] = [];
	blackKeys: Key[] = [];

	held = {} as { [note: string]: number };
	mouseHeld = '';

	hotkeys = { ...leftRightMap };
	noteHotkeys = Object.entries(this.hotkeys).reduce((acc, [k, v]) => {
		acc[v] = k;
		return acc;
	}, {} as { [k: string]: string });

	notedown: NoteDownEvent = new CustomEvent('notedown', {
		bubbles: true,
		detail: {
			note: '',
			velocity: 0,
		},
	});

	noteup: NoteUpEvent = new CustomEvent('noteup', {
		bubbles: true,
		detail: {
			note: '',
		},
	});

	boundKeyDown = this.onKeyDown.bind(this);
	boundKeyUp = this.onKeyUp.bind(this);
	cleanupMidi = () => {};

	connectedCallback() {
		super.connectedCallback();
		this.addEventListener('wheel', ev => this.onWheel(ev));
		this.addEventListener('mousedown', ev => this.onMouse(ev, true));
		this.addEventListener('mouseup', ev => this.onMouse(ev, false));
		this.addEventListener('mousemove', ev => this.onMouseMove(ev));

		document.addEventListener('keydown', this.boundKeyDown);
		document.addEventListener('keyup', this.boundKeyUp);
	}

	disconnectedCallback() {
		document.removeEventListener('keydown', this.boundKeyDown);
		document.removeEventListener('keyup', this.boundKeyUp);
	}

	setOffset(n: number) {
		this.offsetX = clamp(n, this.canvas!.width - this.virtualWidth, 0);
		this.render();
	}

	set midi(m: MIDIInput | undefined) {
		this.cleanupMidi();
		const boundMidi = (ev: Event) => {
			if (!('data' in ev)) return;
			const [pressed, midiNote, velocity] = (ev as MIDIMessageEvent).data;
			const note = Note.fromMidiSharps(midiNote);
			if (pressed == 144) this.onDown(note, velocity);
			if (pressed == 128) this.onUp(note);
		}
		m?.addEventListener('midimessage', boundMidi);
		this.cleanupMidi = () => m?.removeEventListener('midimessage', boundMidi);
	}

	onDown(note: string, velocity: number) {
		if (note in this.held && this.held[note] != 0) return;
		this.held[note] = velocity;
		this.render();

		const event = this.notedown;
		event.detail.note = note;
		event.detail.velocity = velocity;
		this.dispatchEvent(event);
	}

	onUp(note: string) {
		delete this.held[note];
		this.render();

		const event = this.noteup;
		event.detail.note = note;
		this.dispatchEvent(event);
	}

	layout() {
		this.virtualWidth = 0;
		this.whiteKeys.length = 0;
		this.blackKeys.length = 0;

		const whiteHeightPx = this.canvas.height;
		const whiteWidthPx = whiteHeightPx * whiteWidth / whiteHeight;
		const blackHeightPx = whiteHeightPx * blackHeight / whiteHeight;
		const blackWidthPx = whiteHeightPx * blackWidth / whiteHeight;

		let y = this.canvas.height - whiteHeightPx;
		for (let i = 0; i < 128; i++) {
			const note = Note.fromMidiSharps(i);

			const isWhite = note[1] != '#';
			const width = isWhite ? whiteWidthPx : blackWidthPx;
			const height = isWhite ? whiteHeightPx : blackHeightPx;

			let x = this.virtualWidth;
			if (!isWhite) x -= blackWidthPx / 2;
			const key = new Key(x, y, width, height, note);
			(isWhite ? this.whiteKeys : this.blackKeys).push(key);

			if (i == 60) this.virtualMiddle = this.virtualWidth + whiteWidthPx / 2;
			if (isWhite) this.virtualWidth += whiteWidthPx;
		}
	}

	onResize() {
		super.onResize();
		this.layout();

		if (!this.loaded) {
			this.setOffset(this.canvas.width / 2 - this.virtualMiddle);
			this.loaded = true;
		}
	}

	onWheel(ev: WheelEvent) {
		ev.preventDefault();
		const dir = this.rotate ? -ev.deltaY : ev.deltaY;
		this.setOffset(this.offsetX - dir);
		this.onMouseMove(ev);
		this.render();
	}

	onDownOrUp(note: string, isDown: boolean, velocity = 50) {
		if (isDown) this.onDown(note, velocity);
		else this.onUp(note);
	}

	getKey(ev: MouseEvent): Key | undefined {
		const x = ev.offsetX - this.offsetX;
		const y = ev.offsetY;
		for (let i = 0; i < this.blackKeys.length; i++) {
			const hitbox = this.blackKeys[i];
			if (hitbox.contains(x, y)) return hitbox;
		}
		for (let i = 0; i < this.whiteKeys.length; i++) {
			const hitbox = this.whiteKeys[i];
			if (hitbox.contains(x, y)) return hitbox;
		}
	}

	onMouse(ev: MouseEvent, isDown: boolean) {
		if (ev.button != 0) return;
		ev.preventDefault();
		const key = this.getKey(ev);
		if (key) {
			const percent = ev.offsetY / key.height;
			const velocity = Math.max(10, percent * 128);
			this.onDownOrUp(key.note, isDown, velocity);
			this.mouseHeld = isDown ? key.note : '';
		}
	}

	onMouseMove(ev: MouseEvent) {
		if (!(ev.buttons & 1)) return;
		ev.preventDefault();
		const key = this.getKey(ev);
		if (this.mouseHeld != key?.note) {
			this.onUp(this.mouseHeld);
			if (key) this.onDownOrUp(key?.note, true);
		}
		this.mouseHeld = key?.note ?? '';
	}

	onKeyDown(ev: KeyboardEvent) {
		this.onKey(ev, true);
	}

	onKeyUp(ev: KeyboardEvent) {
		this.onKey(ev, false);
	}

	onKey(ev: KeyboardEvent, isDown: boolean) {
		const hotkey = `${ev.shiftKey ? 'Shift+' : ''}${ev.code}`;
		const note = this.hotkeys[hotkey];
		if (note) {
			ev.preventDefault();
			this.onDownOrUp(note, isDown);
		} else if (ev.key == 'Shift') {
			Object.keys(this.held).forEach(note => this.onDownOrUp(note, false));
		}
		this.render();
	}

	renderKey(key: Key) {
		const ctx = this.ctx();
		const isWhite = key.note[1] != '#';

		let { x, y, width, height, note } = key;
		x += this.offsetX;
		if (x + width < 0 || x > ctx.canvas.width) return;

		ctx.fillStyle = isWhite ? 'white' : 'black';
		if (this.held[note]) ctx.fillStyle = 'gray';
		ctx.fillRect(x, y, width, height);
		ctx.strokeRect(x, y, width, height);

		y += height * .85;
		ctx.fillStyle = isWhite ? 'black' : 'white';
		ctx.fillText(note, x + width / 2, y, width);

		const hotkey = this.noteHotkeys[note]
			?.replace('Shift+', '⇧')
			?.replace('Key', '')
			?.replace('Digit', '');
		if (hotkey) {
			y += 20;
			ctx.fillText(hotkey, x + width / 2, y, width);
		}
	}

	render() {
		const ctx = this.ctx();
		if (ctx.canvas.width == 0 || ctx.canvas.height == 0) return;

		ctx.strokeStyle = 'gray';
		ctx.font = '14px Arial';
		ctx.textAlign = 'center';

		for (let i = 0; i < this.whiteKeys.length; i++) this.renderKey(this.whiteKeys[i]);
		for (let i = 0; i < this.blackKeys.length; i++) this.renderKey(this.blackKeys[i]);
	}
}

customElements.define('daw-piano', Piano);
