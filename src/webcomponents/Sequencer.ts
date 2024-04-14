import { AutoResizeCanvas } from './AutoResizeCanvas';
import { Piano } from './Piano';

export class Note {
	constructor(
		public note: string,
		public start: number,
		public end: number,
		public velocity: number,
	) {}
};

export class SequencerCanvas extends AutoResizeCanvas {
	_piano?: Piano;
	notes: Note[] = [
		{ note: 'C4', start: 0, end: 2, velocity: 100 },
		{ note: 'D4', start: 1, end: 2, velocity: 100 },
		{ note: 'C#4', start: 1, end: 2, velocity: 100 },
	];
	virtualWidth = 0;
	offsetX = 0;
	px_per_s = 100;

	set piano(p: Piano | undefined) {
		this._piano = p;
		// this.notes = [];
	}

	private renderNote(_note: Note) {
		const ctx = this.ctx();
		const { note, start, end, velocity } = _note;
		const isWhite = note[1] != '#';

		const key = isWhite
			? this._piano!.whiteKeys.find(k => k.note == note)
			: this._piano!.blackKeys.find(k => k.note == note);

		if (!key) return;

		const width = (end - start) * this.px_per_s;
		const height = key.width;
		const x = start * this.px_per_s + this.offsetX;
		const y = ctx.canvas.height - key.x - this._piano!.offsetX - height;

		if (x < -width || x > ctx.canvas.width) return;
		if (y < -height || y > ctx.canvas.height) return;

		ctx.fillStyle = isWhite ? 'white' : 'black';
		ctx.fillRect(x, y, width, height);
		ctx.strokeRect(x, y, width, height);
	}

	render() {
		const ctx = this.ctx();
		if (ctx.canvas.width == 0 || ctx.canvas.height == 0) return;

		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

		for (let i = 0; i < this.notes.length; i++) this.renderNote(this.notes[i]);

		this.raf();
	}
}

customElements.define('daw-sequencer', SequencerCanvas);
