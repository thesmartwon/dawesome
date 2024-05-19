export abstract class Node {
	static controls: { [key: string]: Control };
	static width: number;
	static height: number;

	static inputPorts: Ports;
	static outputPorts: Ports;

	// abstract connect(output: string, other: Node, input: string): void;
};

export type Control = 'audioparam' | string[];
export interface Port {
	type: 'event' | 'audionode' | 'audioparam';
	range?: [number, number]; // if type == 'event'
};
export type Ports = { [key: string] : Port };
