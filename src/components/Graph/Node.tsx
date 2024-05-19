import { Switch, Match } from 'solid-js';
import { Node as NodeType, Ports as PortsType, Control as ControlType } from '../../audio/nodes';
import styles from './Node.module.css';

export interface NodeProps {
	node: NodeType;
	x: number;
	y: number;
};
export function Node(props: NodeProps) {
	const claz = props.node.constructor as any;

	return (
		<foreignObject x={props.x} y={props.y} width={claz.width} height={claz.height}>
			<div class={styles.form}>
				<Ports node={props} kind="inputPorts" />
				<div class={styles.controls}>
					<h2>
						{claz.name}
					</h2>
					{Object.entries(claz.controls).map(([name, control]) =>
						<Control node={props.node} name={name} control={control as ControlType} />
					)}
				</div>
				<Ports node={props} kind="outputPorts" />
			</div>
		</foreignObject>
	);
}

interface ControlProps {
	node: NodeType;
	name: string;
	control: ControlType;
};
function Control(props: ControlProps) {
	const value = (props.node as any)[props.name];
	return (
		<div>
			<label>{props.name}</label>
			<Switch>
				<Match when={props.control == 'audioparam'}>
					<input
						type="range"
						min={value.minValue}
						max={value.maxValue}
						value={value.value}
						onInput={ev => value.value = +ev.target.value}
					/>
				</Match>
				<Match when={Array.isArray(props.control)}>
					<select name={props.name}>
						{(props.control as string[]).map(v =>
							<option value={v} selected={v == value}>{v}</option>
						)}
					</select>
				</Match>
			</Switch>
		</div>
	);
}

interface Ports {
	node: NodeProps;
	kind: 'inputPorts' | 'outputPorts';
};
function Ports(props: Ports) {
	const claz = props.node.node.constructor as any;
	return (
		<div class={styles.ports}>
			{Object.entries(claz[props.kind] as PortsType).map(([name, port], i) =>
				<span
					class={`${styles.circle} ${styles[port.type]}`}
					title={`${name} (${port.type} ${i})`}
				>
					{name.substring(0, 1).toUpperCase()}
				</span>
			)}
		</div>
	);
}
