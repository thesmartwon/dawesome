import { SortedQueue } from './smplr/player/sorted-queue.js';

export type Note = {
	note: string;
	beat: number;
};
export class Sequence extends SortedQueue<Note> {
	constructor() {
		super((a, b) => a.beat - b.beat);
	}

	serialize(): string {
		return JSON.stringify(this.items);
	}

	static deserialize(json: string): Sequence {
		const res = new Sequence();
		res.items = JSON.parse(json);
		return res;
	}

	uniqueNotes(): string[] {
		const res = {} as { [k: string]: undefined };
		for (let i = 0; i < this.items.length; i++) res[this.items[i].note] = undefined;
		return Object.keys(res);
	}
}
