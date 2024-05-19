import { Sink } from './Sink';
import { Node, Ports } from './Node';
import { AttackOptions } from '../Sampler';
import { Context } from '../Context';

export class Oscillator implements Node {
	static controls = {
		type: ["custom", "sawtooth", "sine", "square", "triangle"],
	};
	static width = 200;
	static height = 100;

	static inputPorts: Ports = { pitch: { type: 'event' } };
	static outputPorts: Ports = { node: { type: 'audionode' } };

	outputs = {
		node: [] as Sink[],
	};

	// Only allow a single tone at a time.
	held: { [freq: number]: OscillatorNode } = {};
	type: OscillatorType = 'sine';

	constructor(public ctx: Context) {}

	attack(frequency: number, opts?: AttackOptions) {
		if (frequency in this.held) return;

		const source = new OscillatorNode(this.ctx.ctx, {
			frequency: frequency,
			type: this.type,
		});
		this.outputs.node.forEach(n => source.connect(n.to.gain));

		this.ctx.play(source);
		this.held[frequency] = source;
	}

	release(frequency: number) {
		this.held[frequency]?.stop();
		delete this.held[frequency];
	}
};
