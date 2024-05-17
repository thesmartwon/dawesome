import { Context } from './Context';
import { AttackOptions } from './Sampler';

export class Synth {
	held: { [freq: number]: AudioScheduledSourceNode } = {};
	effect?: AudioNode;

	constructor(public ctx: Context) {}

	attack(frequency: number, opts?: AttackOptions) {
		const source = new OscillatorNode(this.ctx.ctx, {
			frequency: frequency,
			type: 'sine',
		});

		this.ctx.play(source, this.effect);
		this.held[frequency] = source;
	}

	release(frequency: number) {
		this.held[frequency]?.stop();
		delete this.held[frequency];
	}
}
