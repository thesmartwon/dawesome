import { Context } from './Context';
import { Node, Sink, Oscillator, MidiInput } from './nodes';

type NodeId = number;

export class Graph {
	nodes: { [key: NodeId]: Node };
	connections: Connection[] = [];

	constructor(public ctx: Context) {
		const midi = new MidiInput();
		const osc = new Oscillator(ctx);
		const sink = new Sink(ctx);

		midi.listeners.push(osc);
		osc.outputs.node.push(sink);

		// midi.connect('pitch', osc, 'pitch');
		// osc.connect('node', sink, 'node');
		this.nodes = {
			0: midi,
			1: osc,
			2: sink,
		};
	}
};

export interface Connection {
	from: [NodeId, number];
	to: [NodeId, number];
};
