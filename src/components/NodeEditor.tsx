import { createSignal } from 'solid-js';
import styles from './NodeEditor.module.css';

const identity = new DOMMatrix([1, 0, 0, 1, 0, 0]);

export function NodeEditor() {
	const [transform, setTransform] = createSignal(identity);
	let svg: SVGSVGElement | undefined;

	function onMouseMove(ev: MouseEvent) {
		ev.preventDefault();
		if (!(ev.buttons & 1)) return;

		const t = transform();
		const mat = t.translate(ev.movementX / t.a, ev.movementY / t.d);
		setTransform(mat);
	}

	function onWheel(ev: WheelEvent) {
		ev.preventDefault();
		if (!svg) return;

		const dir = ev.deltaY < 0 ? 1 : -1;
		const xFactor = 1 + .05 * dir;
		const yFactor = 1 + .05 * dir;
		const origin = { x: ev.offsetX, y: ev.offsetY };
		const mat = identity
			.translate(origin.x, origin.y)
			.scale(xFactor, yFactor)
			.translate(-origin.x, -origin.y)
			.multiply(transform());
		setTransform(mat);
	}

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			stroke="red"
			fill="grey"
			class={styles.editor}
			onMouseMove={onMouseMove}
			onWheel={onWheel}
			ref={svg}
		>
			<g transform={transform().toString()}>
				<circle cx="50" cy="50" r="40" />
				<circle cx="150" cy="50" r="4" />
			</g>
		</svg>
	);
}
