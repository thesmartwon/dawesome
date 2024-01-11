import { SortedQueue } from './smplr/player/sorted-queue.js';

export type Note = {
	note: string;
	beat: number;
};
export class Sequence extends SortedQueue<Note> {
	constructor() {
		super((a, b) => a.beat - b.beat);
	}

	serialize(): Note[] {
		return this.items;
	}

	static deserialize(items: Note[]): Sequence {
		const res = new Sequence();
		res.items = items;
		return res;
	}

	uniqueNotes(): string[] {
		const res = {} as { [k: string]: undefined };
		for (let i = 0; i < this.items.length; i++) res[this.items[i].note] = undefined;
		return Object.keys(res);
	}
}
