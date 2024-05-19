import { Node, Ports } from './Node';
import { AttackOptions } from '../Sampler';

export class MidiInput implements Node {
	static controls = {};
	static width = 100;
	static height = 200;
	static inputPorts: Ports = {};
	static outputPorts: Ports = {
		number: { type: 'event', range: [0, 127] },
		pitch: { type: 'event', range: [8.18, 12_543.85] },
		velocity: { type: 'event', range: [0, 127] },
		gain: { type: 'event', range: [0, 1] },
	};

	listeners = [] as {
		attack(frequency: number, opts?: AttackOptions): void;
		release(frequency: number): void;
	}[];

	attack(frequency: number, opts?: AttackOptions) {
		this.listeners.forEach(l => l.attack(frequency, opts));
	}

	release(frequency: number) {
		this.listeners.forEach(l => l.release(frequency));
	}
};
