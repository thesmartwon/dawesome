import { AutoResizeCanvas } from './AutoResizeCanvas';

export class DrumsCanvas extends AutoResizeCanvas {
	connectedCallback() {
		// this.addEventListener('click', () => onKeyDown('kick', 1));
	}

	render() {
		const ctx = this.ctx();
		ctx.fillStyle = 'yellow';
		ctx.fillRect(0, 0, this.width, this.height);

		requestAnimationFrame(() => this.render());
	}
}
