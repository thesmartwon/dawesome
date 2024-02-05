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
	'1': 'C2',
	'!': 'C#2',
	'2': 'D2',
	'@': 'D#2',
	'3': 'E2',
	'4': 'F2',
	'$': 'F#2',
	'5': 'G2',
	'%': 'G#2',

	'q': 'A2',
	'Q': 'A#2',
	'w': 'B2',
	'e': 'C3',
	'E': 'C#3',
	'r': 'D3',
	'R': 'D#3',
	't': 'E3',

	'a': 'F3',
	'A': 'F#3',
	's': 'G3',
	'S': 'G#3',
	'd': 'A3',
	'D': 'A#3',
	'f': 'B3',
	'g': 'C4',
	'G': 'C#4',

	'z': 'D4',
	'Z': 'D#4',
	'x': 'E4',
	'c': 'F4',
	'C': 'F#4',
	'v': 'G4',
	'V': 'G#4',
	'b': 'A4',
	'B': 'A#4',

	// right hand
	'6': 'B4',
	'7': 'C5',
	'&': 'C#5',
	'8': 'D5',
	'*': 'D#5',
	'9': 'E5',
	'0': 'F5',
	')': 'F#5',

	'y': 'G5',
	'Y': 'G#5',
	'u': 'A5',
	'U': 'A#5',
	'i': 'B5',
	'o': 'C6',
	'O': 'C#6',
	'p': 'D6',
	'P': 'D#6',

	'h': 'E6',
	'j': 'F6',
	'J': 'F#6',
	'k': 'G6',
	'K': 'G#6',
	'l': 'A6',
	'L': 'A#6',
	';': 'B6',

	'n': 'C7',
	'N': 'C#7',
	'm': 'D7',
	'M': 'D#7',
	',': 'E7',
	'.': 'F7',
	'>': 'F#7',
	'/': 'G7',
	'?': 'G#7',
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
	static observedAttributes = ['midi'];

	offsetX = 0;
	virtualWidth = 0;
	virtualMiddle = 0;
	loaded = false;

	whiteKeys: Key[] = [];
	blackKeys: Key[] = [];

	held = {} as { [key: string]: number };
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

	boundKeyDown;
	boundKeyUp;
	cleanupMidi = () => {};

	constructor() {
		super();
		this.boundKeyDown = this.onKeyDown.bind(this);
		this.boundKeyUp = this.onKeyUp.bind(this);
	}

	connectedCallback() {
		this.addEventListener('wheel', ev => this.onWheel(ev));
		this.addEventListener('mousedown', ev => this.onMouse(ev, true));
		this.addEventListener('mouseup', ev => this.onMouse(ev, false));
		this.addEventListener('mousemove', ev => this.onMouseMove(ev));

		document.addEventListener('keydown', this.boundKeyDown);
		document.addEventListener('keyup', this.boundKeyUp);

		this.render();
	}

	disconnectedCallback() {
		document.removeEventListener('keydown', this.boundKeyDown);
		document.removeEventListener('keyup', this.boundKeyUp);
	}

	setOffset(n: number) {
		this.offsetX = clamp(n, this.width - this.virtualWidth, 0);
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
		this.held[note] = 0;
		this.render();

		const event = this.noteup;
		event.detail.note = note;
		this.dispatchEvent(event);
	}

	layout() {
		this.virtualWidth = 0;
		this.whiteKeys.length = 0;
		this.blackKeys.length = 0;

		const whiteHeightPx = this.height;
		const whiteWidthPx = whiteHeightPx * whiteWidth / whiteHeight;
		const blackHeightPx = whiteHeightPx * blackHeight / whiteHeight;
		const blackWidthPx = whiteHeightPx * blackWidth / whiteHeight;

		let y = this.height - whiteHeightPx;
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
			this.setOffset(this.width / 2 - this.virtualMiddle);
			this.loaded = true;
		}

		this.render();
	}

	onWheel(ev: WheelEvent) {
		ev.preventDefault();
		const dir = ev.deltaY;
		this.setOffset(this.offsetX - dir);
		this.render();
	}

	onDownOrUp(note: string, isDown: boolean, velocity = 100) {
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
		const note = this.hotkeys[ev.key];
		if (note) {
			this.onDownOrUp(note, isDown);

			if (!isDown) {
				const lowerCaseHotkey = ev.key.toLowerCase();
				const lowerNote = this.hotkeys[lowerCaseHotkey];
				if (lowerNote && lowerNote != note) this.onUp(lowerNote);

				const upperCaseHotkey = ev.key.toUpperCase();
				const upperNote = this.hotkeys[upperCaseHotkey];
				if (upperNote && upperNote != note) this.onUp(upperNote);
			}
			ev.preventDefault();
		}
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

		const hotkey = this.noteHotkeys[note];
		if (hotkey) {
			y += 20;
			ctx.fillText(hotkey, x + width / 2, y, width);
		}
	}

	renderKeys() {
		const ctx = this.ctx();
		if (ctx.canvas.width == 0 || ctx.canvas.height == 0) return;

		ctx.strokeStyle = 'gray';
		ctx.font = '14px Arial';
		ctx.textAlign = 'center';

		for (let i = 0; i < this.whiteKeys.length; i++) this.renderKey(this.whiteKeys[i]);
		for (let i = 0; i < this.blackKeys.length; i++) this.renderKey(this.blackKeys[i]);
	}

	render() {
		requestAnimationFrame(() => this.renderKeys());
	}
}

customElements.define('daw-piano', Piano, { extends: 'canvas' });
