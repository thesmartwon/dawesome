import { AutoResizeCanvas } from './AutoResizeCanvas';
import { Piano, Key } from './Piano';
import { DisplayKey } from './PianoPlayed';

export class SequencerCanvas extends AutoResizeCanvas {
	_piano?: Piano;
	keys: DisplayKey[] = [];

	set piano(p: Piano | undefined) {
		this._piano = p;
		this.keys = [];
	}

	connectedCallback() {
		this.render();
	}

	private renderKey(key: Key) {
		const ctx = this.ctx();
		const isWhite = key.note[1] != '#';

		let { y, width, height } = key;
		const x = 0;
		y += this._piano!.offsetX;
		// if (x + width < 0 || x > ctx.canvas.width) return;

		ctx.fillStyle = isWhite ? 'white' : 'black';
		ctx.fillRect(x, y, width, height);
		ctx.strokeRect(x, y, width, height);
	}

	render() {
		const ctx = this.ctx();
		if (ctx.canvas.width == 0 || ctx.canvas.height == 0) return;

		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

		for (let i = 0; i < (this._piano?.blackKeys.length ?? 0); i++)
			this.renderKey(this._piano!.blackKeys[i]);

		for (let i = 0; i < (this._piano?.whiteKeys.length ?? 0); i++)
			this.renderKey(this._piano!.whiteKeys[i]);

		this.render();
	}
}

customElements.define('daw-sequencer', SequencerCanvas, { extends: 'canvas' });
