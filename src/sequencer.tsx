import { useState } from 'preact/hooks';
import { getCtx, getStorage } from './lib/ctx.js';
import type { Index, UserIndex } from './types.js';
import { Sampler } from './smplr/index.js';
import { Percussion } from './input/percussion/sequence.js';
import { Signal } from '@preact/signals';
import { Sequence } from './sequence.js';
import { Header } from './input/header.js';
import builderClasses from './instrument-builder.css';

function makeInstrument(userIndex: UserIndex, id: string) {
	const storage = getStorage();
	return new Sampler(getCtx(), id, { samples: userIndex[id], storage });
}

class InstrumentSequence {
	constructor(
		public instrument: Sampler,
		public bpm: number,
		public sequence: Sequence,
	) {}

	serialize() {
		return {
			instrument: this.instrument.id(),
			sequence: this.sequence.items,
		};
	}

	static deserialize(userIndex: UserIndex, parsed: any): InstrumentSequence {
		const instrument = makeInstrument(userIndex, parsed.instrument);
		return new InstrumentSequence(instrument, parsed.bpm, Sequence.deserialize(parsed.sequence));
	}
}
type InstrumentSequences = {
	[k: string]: InstrumentSequence
};

function saveSequences(sequences: InstrumentSequences) {
	const toSerialize = Object.entries(sequences).reduce((acc, [k, v]) => {
		acc[k] = v.serialize();
		return acc;
	}, {} as { [k: string]: any });
	localStorage.setItem('sequences', JSON.stringify(toSerialize));
}

function loadSequences(userIndex: UserIndex): InstrumentSequences {
	const existing = localStorage.getItem('sequences');
	if (!existing) return {};
	const parsed = JSON.parse(existing);
	return Object.entries(parsed).reduce((acc, [k, v]) => {
		acc[k] = InstrumentSequence.deserialize(userIndex, v);
		return acc;
	}, {} as InstrumentSequences);
}

export interface SequencerProps {
	index: Index;
	userIndex: Signal<UserIndex>;
}
export function Sequencer({ userIndex }: SequencerProps) {
	const [sequences, setSequences] = useState(loadSequences(userIndex.value));
	const [name, setName] = useState(Object.keys(sequences)[0]);
	const [instrumentId, setInstrumentId] = useState(Object.keys(userIndex.value)[0]);

	function setter(sequences: InstrumentSequences) {
		setSequences(sequences);
		saveSequences(sequences);
	}

	function addSequence() {
		let newName = '';
		for (let i = 1; newName in sequences || newName.length === 0; i++) {
			newName = `Sequence ${i}`;
		}
		const instrument = makeInstrument(userIndex.value, instrumentId);
		setter({
			...sequences,
			[newName]: new InstrumentSequence(instrument, 60, new Sequence())
		});
	}

	function rename(ev: any, newName: string) {
		if (sequences[newName]) {
			ev.currentTarget.innerText = name;
			return;
		}
		sequences[newName] = sequences[name];
		delete sequences[name];
		setter({ ...sequences });
		setName(newName);
	}

	return (
		<div>
			<ul>
				{Object.entries(sequences).map(([k, v]) =>
					<li>
						<div class={builderClasses.titleRow}>
							<Header value={k} onChange={rename} />
							<button onClick={() => {
								delete sequences[k];
								setter({ ...sequences });
							}}>
								x
							</button>
						</div>
						<Percussion
							drums={v.instrument as Sampler}
							sequence={v.sequence}
							onChange={() => saveSequences(sequences)}
						/>
					</li>
				)}
			</ul>
			<div>
				<select
					value={instrumentId}
					name="instrumentId"
					onChange={ev => setInstrumentId(ev.currentTarget.value)}
				>
					{Object.keys(userIndex.value).map(k =>
						<option value={k}>{k}</option>
					)}
				</select>
				<button disabled={!instrumentId} onClick={addSequence}>
					Add
				</button>
			</div>
		</div>
	);
}
