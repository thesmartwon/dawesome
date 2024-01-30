import { debounce, clamp } from '../Helpers';
import { Note } from 'tonal';

// Ratios.
const whiteHeight = 12.2;
const whiteWidth = 2.2;
const blackWidth = 1.5;
const blackHeight = 7.2;

function getContext(canvas: HTMLCanvasElement) {
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('2d context not supported');
	return ctx;
}

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

class Key {
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

export class PianoCanvas {
	offsetX = 0;
	virtualWidth = 0;
	virtualMiddle = 0;
	loaded = false;

	whiteHeightPx = 0;
	blackHeightPx = 0;
	whiteKeys: Key[] = [];
	blackKeys: Key[] = [];

	held = {} as { [key: string]: number };
	mouseHeld = '';

	hotkeys = { ...leftRightMap };
	noteHotkeys = Object.entries(this.hotkeys).reduce((acc, [k, v]) => {
		acc[v] = k;
		return acc;
	}, {} as { [k: string]: string });

	midiInput?: MIDIInput;

	constructor(
		public canvas: HTMLCanvasElement,
		public onKeyDown: (note: string, velocity: number) => void,
		public onKeyUp: (note: string) => void,
	) {
		new ResizeObserver(debounce(() => this.onResize())).observe(canvas);

		canvas.addEventListener('wheel', ev => this.onWheel(ev));
		canvas.addEventListener('mousedown', ev => this.onMouse(ev, true));
		canvas.addEventListener('mouseup', ev => this.onMouse(ev, false));
		canvas.addEventListener('mousemove', ev => this.onMouseMove(ev));
		canvas.addEventListener('contextmenu', ev => this.onContextMenu(ev));
		document.addEventListener('keydown', ev => this.onKey(ev, true));
		document.addEventListener('keyup', ev => this.onKey(ev, false));
	}

	setOffset(n: number) {
		this.offsetX = clamp(n, this.canvas.width - this.virtualWidth, 0);
		this.render();
	}

	setMidiInput(midi?: MIDIInput) {
		this.midiInput?.removeEventListener('midimessage', ev => this.onMidiMessage(ev as MIDIMessageEvent));
		midi?.addEventListener('midimessage', ev => this.onMidiMessage(ev as MIDIMessageEvent));
	}

	onDown(note: string, velocity: number) {
		this.held[note] = velocity;
		this.render();
		// User callback
		this.onKeyDown(note, velocity);
	}

	onUp(note: string) {
		this.held[note] = 0;
		this.render();
		// User callback
		this.onKeyUp(note);
	}

	private onMidiMessage(ev: MIDIMessageEvent) {
		const [pressed, midiNote, velocity] = ev.data;
		const note = Note.fromMidiSharps(midiNote);
		if (pressed == 144) this.onDown(note, velocity);
		if (pressed == 128) this.onUp(note);
	}

	private layout() {
		this.virtualWidth = 0;
		this.whiteKeys = [];
		this.blackKeys = [];
		const whiteHeightPx = this.whiteHeightPx = this.canvas.height;
		const whiteWidthPx = whiteHeightPx * whiteWidth / whiteHeight;
		const blackHeightPx = this.blackHeightPx = whiteHeightPx * blackHeight / whiteHeight;
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

	private onDownOrUp(note: string, isDown: boolean, velocity = 100) {
		if (isDown) this.onDown(note, velocity);
		else this.onUp(note);
	}

	private getNote(ev: MouseEvent): string | undefined {
		const x = ev.offsetX - this.offsetX;
		const y = ev.offsetY;
		for (let i = 0; i < this.blackKeys.length; i++) {
			const hitbox = this.blackKeys[i];
			if (hitbox.contains(x, y)) return hitbox.note;
		}
		for (let i = 0; i < this.whiteKeys.length; i++) {
			const hitbox = this.whiteKeys[i];
			if (hitbox.contains(x, y)) return hitbox.note;
		}
	}

	private onMouse(ev: MouseEvent, isDown: boolean) {
		if (ev.button != 0) return;
		ev.preventDefault();
		const note = this.getNote(ev);
		if (note) {
			const isWhite = note[1] != '#';
			const height = isWhite ? this.whiteHeightPx : this.blackHeightPx
			const velocity = Math.max(10, ev.offsetY / height * 128);
			this.onDownOrUp(note, isDown, velocity);
			this.mouseHeld = isDown ? note : '';
		}
	}

	private onMouseMove(ev: MouseEvent) {
		if (!(ev.buttons & 1)) return;
		ev.preventDefault();
		const note = this.getNote(ev);
		if (this.mouseHeld != note) {
			this.onUp(this.mouseHeld);
			if (note) this.onDownOrUp(note, true);
		}
		this.mouseHeld = note ?? '';
	}

	private onKey(ev: KeyboardEvent, isDown: boolean) {
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

	private onContextMenu(ev: MouseEvent) {
		ev.preventDefault();
	}

	private renderKey(key: Key) {
		const ctx = getContext(this.canvas);
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

	private renderKeys() {
		const ctx = getContext(this.canvas);
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
