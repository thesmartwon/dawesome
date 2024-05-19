import { Node, Ports } from './Node';

export class Gain extends GainNode implements Node {
	static controls = {
		gain: 'audioparam',
	};
	static width = 300;
	static height = 100;

	static inputPorts: Ports = { node: { type: 'audionode' }};
	static outputPorts: Ports = { node: { type: 'audionode' }};

	connect(...args: any) {
		return super.connect(args);
	}
	disconnect(...args: any) {
		super.disconnect(args);
	}
};
