import { createMemo } from 'solid-js';
import { Node as NodeType } from '../../audio/nodes';

export interface NodeProps {
	node: NodeType;
	x: number;
	y: number;
};
export function Node(props: NodeProps) {
	const width = 200;
	const height = 100;
	const n_inputs = createMemo(() => props.node.numberOfInputs);
	const n_outputs = createMemo(() => props.node.numberOfOutputs);

	return (
		<g>
			<rect x={props.x} y={props.y} width={width} height={height} />
			<text x={props.x} y={props.y}>
				{(props.node.constructor as any).tag}
			</text>
			{Array.from(Array(n_inputs()).keys()).map(i =>
				<Connector x={props.x} y={props.y} height={height} len={n_inputs()} i={i} />
			)}
			{Array.from(Array(n_outputs()).keys()).map(i =>
				<Connector x={props.x + width} y={props.y} height={height} len={n_outputs()} i={i} />
			)}
		</g>
	);
}

interface ConnectorProps {
	x: number;
	y: number;
	height: number;
	len: number;
	i: number;
};
function Connector(props: ConnectorProps) {
	return (
		<circle
			cx={props.x}
			cy={props.y + props.i * props.height / props.len + props.height / (props.len * 2)}
			r={14}
		/>
	);
}
