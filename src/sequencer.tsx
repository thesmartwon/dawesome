import { useState } from 'preact/hooks';
import { getCtx, getStorage } from './lib/ctx.js';
import type { Index, UserIndex, Category } from './types.js';
import { Sampler } from './smplr/index.js';
import { Percussion } from './input/percussion/sequence.js';
import { Signal } from '@preact/signals';
import { Sequence } from './sequence.js';

interface InstrumentSequence {
	instrument: Sampler;
	sequence: Sequence;
}

function makeInstrument(userIndex: UserIndex, id: string) {
	const storage = getStorage();
	return new Sampler(getCtx(), id, { samples: userIndex[id], storage });
}

function saveSequences(sequences: InstrumentSequence[]) {
	const toSerialize = sequences.map(s => ({
		id: s.instrument.id(),
		sequence: s.sequence.serialize(),
	}));
	localStorage.setItem('sequences', JSON.stringify(toSerialize));
}

function loadSequences(userIndex: UserIndex): InstrumentSequence[] {
	const existing = localStorage.getItem('sequences');
	if (!existing) return [];
	return JSON.parse(existing).map(({ id, sequence }: { id: string, sequence: string }) => {
		return {
			instrument: makeInstrument(userIndex, id),
			sequence: Sequence.deserialize(sequence),
		};
	});
}

export interface SequencerProps {
	index: Index;
	userIndex: Signal<UserIndex>;
}
export function Sequencer({ userIndex }: SequencerProps) {
	const [sequences, setSequences] = useState(loadSequences(userIndex.value));
	const [id, setId] = useState(Object.keys(userIndex.value)[0]);

	function addInstrument() {
		makeInstrument(userIndex.value, id)?.load.then(instrument => {
			setSequences([...sequences, { instrument, sequence: new Sequence() }]);
		});
	}

	return (
		<div>
			<ul>
				{sequences.map((s, i) =>
					<li>
						<h2>
							<span>{s.instrument.name}</span>
							<button onClick={() => {
								sequences.splice(i, 1);
								setSequences([...sequences]);
								saveSequences(sequences)
							}}>
								Delete
							</button>
						</h2>
						<Percussion
							drums={s.instrument as Sampler}
							sequence={s.sequence}
							onChange={() => saveSequences(sequences)}
						/>
					</li>
				)}
			</ul>
			<div>
				<select
					value={id}
					name="instrument"
					onChange={ev => setId(ev.currentTarget.value as Category)}
				>
					{Object.keys(userIndex.value).map(k =>
						<option value={k}>{k}</option>
					)}
				</select>
				<button disabled={!id} onClick={addInstrument}>
					Add
				</button>
			</div>
		</div>
	);
}
