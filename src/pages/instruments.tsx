import { InstrumentPlayer } from '../instrument.js';
import { InstrumentBuilder } from '../instrument-builder.js';
import { useEffect, useState } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { classnames } from '../helpers.js';
import { addInstrument, getInstruments, Instrument, deleteInstrument, eventEmitter } from '../lib/db.js';
import type { PageProps } from './pages.js';
import classes from './instruments.css';

type InstrumentIndex = {
	[category: string]: Instrument[]
};
export interface InstrumentPicker {
	index: InstrumentIndex;
	onPick: (c: string, n: string, id?: number) => void;
	onAdd?: (c: string) => void;
	onDelete?: (id?: number) => void;
	class?: string;
}
export function InstrumentPicker({ index, onPick, onAdd, onDelete, class: className }: InstrumentPicker) {
	return (
		<div class={className}>
			{Object.entries(index).map(([category, instruments]) =>
				<details open>
					<summary>
						{category}
					</summary>
					<ul>
						{instruments.map(({ name, id }) =>
							<li>
								<button onClick={() => onPick(category, name, id)}>
									{name}
								</button>
								{onDelete &&
									<button onClick={() => onDelete(id)}>
										x
									</button>
								}
							</li>
						)}

						{onAdd &&
							<li>
								<button onClick={() => onAdd(category)}>
									+
								</button>
							</li>
						}
					</ul>
				</details>
			)}
		</div>
	);
}

export interface UserInstrumentPicker {
	onPick: (category: string, name: string, id?: number) => void;
	onDelete: (id?: number) => void;
}
const getDefaultUserIndex = () => ({ percussion: [] });
export function UserInstrumentPicker({ onPick, onDelete}: UserInstrumentPicker) {
	type Names = { [k: string]: undefined };
	const [index, setIndex] = useState<InstrumentIndex>(getDefaultUserIndex());
	const [names, setNames] = useState<Names>({});

	useEffect(() => {
		function fetchInstruments() {
			getInstruments().then(instruments => {
				let newNames: Names = {};
				let newIndex: InstrumentIndex = getDefaultUserIndex();
				instruments.forEach(cur => {
					newIndex[cur.category] = newIndex[cur.category] || [];
					newIndex[cur.category].push(cur);
					newNames[cur.name] = undefined;
				});
				setNames(newNames);
				setIndex(newIndex);
			});
		}
		fetchInstruments();

		eventEmitter.addEventListener('instruments', fetchInstruments);
		return () => eventEmitter.removeEventListener('instruments', fetchInstruments);
	}, []);

	function onAdd(category: string) {
		let name = '';
		for (let i = 1; name in names || name.length === 0; i++) name = `Custom ${category} ${i}`;
		const toAdd: Instrument = { name, category };
		addInstrument(toAdd);
	}

	function myOnDelete(id?: number) {
		if (!id) return;
		deleteInstrument(id);
		onDelete(id);
	}

	return (
		<InstrumentPicker
			class={classes.user}
			index={index}
			onPick={onPick}
			onAdd={onAdd}
			onDelete={myOnDelete}
		/>
	);
}

export default function Instruments({ index }: PageProps) {
	const instrument = useSignal<Instrument | undefined>(undefined);
	const userInstrument = useSignal<Instrument | undefined>(undefined);

	const instrumentIndex = Object.entries(index)
		.reduce((acc, [category, instrumentFiles]) => {
			Object.keys(instrumentFiles).forEach(name => {
				acc[category] = acc[category] || [];
				acc[category].push({ name, category });
			});
			return acc;
		}, {} as InstrumentIndex);

	return (
		<div class={classes.sidebarLayout}>
			<div class={classnames(classes.overflow, classes.left)}>
				<InstrumentPicker index={instrumentIndex} onPick={(category, name) => {
					instrument.value = { category, name };
				}} />
				<UserInstrumentPicker
					onDelete={id => {
						if (userInstrument.value?.id == id) userInstrument.value = undefined;
					}}
					onPick={(category, name, id) => userInstrument.value = { category, name, id }}
				/>
			</div>
			<div class={classes.content}>
				<h1>{instrument.value?.name ?? ''}</h1>
				<div class={classes.overflow}>
					<InstrumentPlayer
						instrument={instrument.value}
						files={index?.[instrument.value?.category ?? '']?.[instrument.value?.name ?? ''] ?? []}
					/>
				</div>
			</div>
			<div class={classnames(classes.overflow, classes.right)}>
				<InstrumentBuilder instrument={userInstrument.value} />
			</div>
		</div>
	);
}
