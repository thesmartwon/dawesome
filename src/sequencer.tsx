import { useSignal } from '@preact/signals';
import { useState } from 'preact/hooks';
import { getCtx, getStorage } from './lib/ctx.js';
import type { Index, Category } from './types.js';
import { DrumMachine, SplendidGrandPiano } from './smplr/index.js';
import { PercussionSequencer } from './input/percussion.js';
import classes from './main.css';

type Instrument = DrumMachine | SplendidGrandPiano;

function InstrumentSequencer({ instrument }: { instrument: Instrument }) {
	if (instrument.category === 'percussion') {
		return <PercussionSequencer drums={instrument as DrumMachine} />;
	}

	return (
		<div>
			no instrument sequencer for {instrument.category}
		</div>
	);
}

export interface SequencerProps {
	index: Index;
}

export function Sequencer({ index }: SequencerProps) {
	const instruments = useSignal<Instrument[]>([]);
	const [category, setCategory] = useState<Category>(Object.keys(index)[0] as Category);
	const [instrument, setInstrument] = useState(Object.keys(index[category])[0]);

	function addInstrument() {
		const url = `${SAMPLE_URL}/${category}/${instrument}`;
		switch (category) {
			case 'percussion': {
				const files = index?.[category]?.[instrument] ?? []
				new DrumMachine(getCtx(), { url, files, storage: getStorage() }).load.then(m => {
					instruments.value = instruments.value.concat(m);
				});
				break;
			}
			case 'strings': {
				new SplendidGrandPiano(getCtx(), url, { storage: getStorage() }).load.then(m => {
					instruments.value = instruments.value.concat(m);
				});
				break;
			}
			default:
				console.error('unknown instrument category', category);
		}
	}

	return (
		<>
			<div class={classes.sidebar}>
				<select
					value={category}
					name="instrument category"
					onChange={ev => {
						const newCategory = ev.currentTarget.value as Category;
						setCategory(newCategory);
						setInstrument(Object.keys(index[newCategory])[0]);
					}}
				>
					{Object.keys(index).map(k =>
						<option value={k}>{k}</option>
					)}
				</select>
				<select
					value={instrument}
					name="instrument"
					onChange={ev => setInstrument(ev.currentTarget.value as Category)}
				>
					{Object.keys(index[category] ?? []).map(k =>
						<option value={k}>{k}</option>
					)}
				</select>
				<button disabled={!instrument} onClick={addInstrument}>
					Add
				</button>
			</div>
			<div class={classes.content}>
				<ul>
					{instruments.value.map(i =>
						<li>
							<h2>{i.name}</h2>
							<InstrumentSequencer instrument={i} />
						</li>
					)}
				</ul>
			</div>
		</>
	);
}
