import { SortedQueue } from './smplr/player/sorted-queue.js';

export type SequenceNote = {
	note: string;
	beat: number;
};
export class Sequence extends SortedQueue<SequenceNote> {
	constructor() {
		super((a, b) => a.beat - b.beat);
	}

	uniqueNotes(): string[] {
		const res = {} as { [k: string]: undefined };
		for (let i = 0; i < this.items.length; i++) res[this.items[i].note] = undefined;
		return Object.keys(res);
	}
}
