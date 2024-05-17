import { createSignal, For } from 'solid-js';
import { createStore } from 'solid-js/store';
import { Node as DisplayNode, NodeProps } from './NodeEditor/Node';
import { Gain } from '../audio/nodes/GainNode';
import { Context } from '../audio/Context';
import styles from './NodeEditor.module.css';

const identity = new DOMMatrix([1, 0, 0, 1, 0, 0]);

interface NodeEditorProps {
	ctx: Context;
	onChange(node?: AudioNode): void;
};
export function NodeEditor(props: NodeEditorProps) {
	const [transform, setTransform] = createSignal(identity);
	let svg: SVGSVGElement | undefined;
  const [nodes, setNodes] = createStore<NodeProps[]>([
		{ node: new Gain(props.ctx.ctx, { gain: 0.2 }), x: 100, y: 100 }
	]);

	function onMouseMove(ev: MouseEvent) {
		if (!(ev.buttons & 1)) return;
		ev.preventDefault();

		const t = transform();
		const mat = t.translate(ev.movementX / t.a, ev.movementY / t.d);
		setTransform(mat);
	}

	function onWheel(ev: WheelEvent) {
		if (!svg) return;
		ev.preventDefault();

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
				<For each={nodes}>{node =>
					<DisplayNode {...node} />
				}</For>
			</g>
		</svg>
	);
}
