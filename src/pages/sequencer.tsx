import { useState, useEffect } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { Sampler } from '../smplr/sampler.js';
import { Heading } from '../input/heading.js';
import { Sequence } from '../lib/sequence.js';
import { getSequences, eventEmitter, addSequence, InstrumentSequence, putSequence, deleteSequence } from '../lib/db.js';
import { getCtx } from '../lib/ctx.js';
import builderClasses from '../instrument-builder.css';
import type { PageProps } from './pages.js';

function InnerSequence({ sequence: inSequence }: { sequence: InstrumentSequence }) {
	const sequence = useSignal(inSequence);
	const instrument = useSignal(new Sampler(getCtx()));

	function onRename(ev: any, newName: string) {
		putSequence({ ...sequence.value, name: newName })
			.catch(err => {
				// Name already taken
				if (err.name == 'ConstraintError') ev.target.innerText = sequence.value.name;
			});
	}

	return (
		<li>
			<div class={builderClasses.titleRow}>
				<Heading value={sequence.value.name} onChange={(ev, newName) => onRename(ev, newName)} />
				<button onClick={() => deleteSequence(sequence.value.id ?? -1)}>
					x
				</button>
			</div>
			<label>
				Input type
				<select value={sequence.value.type} onChange={ev => {
					sequence.value = { ...sequence.value, type: ev.currentTarget.value as any };
					putSequence(sequence.value);
				}}>
					{['pad', 'roll'].map(t =>
						<option value={t}>{t}</option>
					)}
				</select>
			</label>
			<label>
				Instrument
				<select value={sequence.value.instrumentId} onChange={ev => {
					sequence.value = { ...sequence.value, type: ev.currentTarget.value as any };
					putSequence(sequence.value);
				}}>
				</select>
			</label>
		</li>
	);
}

export default function Sequencer(_: PageProps) {
	type Names = { [k: string]: undefined };
	const [sequences, setSequences] = useState<InstrumentSequence[]>([]);
	const [names, setNames] = useState<Names>({});

	useEffect(() => {
		function fetchSequences() {
			getSequences().then(setSequences);
			getSequences().then(sequences => {
				let newNames = sequences.reduce((acc, cur) => {
					acc[cur.name] = undefined;
					return acc;
				}, {} as Names);
				setNames(newNames);
				setSequences(sequences);
			});
		}
		fetchSequences();

		eventEmitter.addEventListener('sequences', fetchSequences);
		return () => eventEmitter.removeEventListener('sequences', fetchSequences);
	}, []);

	function onAdd() {
		let name = '';
		for (let i = 1; name in names || name.length === 0; i++) name = `Sequence ${i}`;
		const toAdd: InstrumentSequence = { name, bpm: 60, type: 'pad', notes: [] };
		addSequence(toAdd);
	}

	return (
		<div>
			<ul>
				{sequences.map(s =>
					<InnerSequence sequence={s} />
				)}
			</ul>
			<div>
				<button onClick={onAdd}>
					Add
				</button>
			</div>
		</div>
	);
}
