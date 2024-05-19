import { createSignal, For } from 'solid-js';
import { createStore } from 'solid-js/store';
import { Node as DisplayNode, NodeProps } from './Graph/Node';
import { Graph as GraphType } from '../audio/Graph';
import styles from './Graph.module.css';

const identity = new DOMMatrix([1, 0, 0, 1, 0, 0]);

interface GraphProps {
	graph: GraphType;
};
export function Graph(props: GraphProps) {
	const [transform, setTransform] = createSignal(identity);
	let svg: SVGSVGElement | undefined;
  const [nodes, setNodes] = createStore<NodeProps[]>(Object.values(props.graph.nodes).map((node, i) => (
		{ node, x: 400 * i, y: 100 }
	)));

	function onMouseMove(ev: MouseEvent) {
		if (!(ev.buttons & 4)) return;
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
		const rect = svg.getBoundingClientRect();
		const offsetX = ev.x - rect.x;
		const offsetY = ev.y - rect.y;
		const origin = { x: offsetX, y: offsetY };
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
