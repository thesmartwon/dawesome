import { InstrumentPlayer } from './instrument.js';
import { InstrumentBuilder } from './instrument-builder.js';
import { useEffect, useState } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { classnames } from './helpers.js';
import classes from './instruments.css';
import { addInstrument, getInstruments, Instrument, deleteInstrument, eventEmitter } from './db.js';

type InstrumentIndex = {
	[k in Category]: Instrument[]
};
export interface InstrumentPicker {
	index: InstrumentIndex;
	onPick: (c: Category, n: string, id?: number) => void;
	onAdd?: (c: Category) => void;
	onDelete?: (id?: number) => void;
	class?: string;
}
export function InstrumentPicker({ index, onPick, onAdd, onDelete, class: className }: InstrumentPicker) {
	return (
		<div class={className}>
			{Object.entries(index).map(([category, instruments], i) =>
				<details open={i == 0 || Boolean(onAdd)}>
					<summary>
						{category}
					</summary>
					<ul>
						{instruments.map(({ name, id }) =>
							<li>
								<button onClick={() => onPick(category as Category, name, id)}>
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
								<button onClick={() => onAdd(category as Category)}>
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

const getDefaultIndex = () => ({
	percussion: [],
	strings: [],
	wind: [],
	electronic: [],
}) as InstrumentIndex;

export interface UserInstrumentPicker {
	onPick: (category: Category, name: string, id?: number) => void;
	onDelete: (id?: number) => void;
}
export function UserInstrumentPicker({ onPick, onDelete}: UserInstrumentPicker) {
	type Names = { [k: string]: undefined };
	const [index, setIndex] = useState<InstrumentIndex>(getDefaultIndex());
	const [names, setNames] = useState<Names>({});

	useEffect(() => {
		function fetchInstruments() {
			getInstruments().then(instruments => {
				let newNames: Names = {};
				let newIndex = getDefaultIndex();
				instruments.forEach(cur => {
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

	function onAdd(category: Category) {
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

const getDefaultInstrument = () => ({ category: 'percussion', name: '' } as Instrument);

export interface InstrumentsProps {
	index: Index;
}
export function Instruments({ index }: InstrumentsProps) {
	const instrument = useSignal(getDefaultInstrument());
	const userInstrument = useSignal(getDefaultInstrument());

	const instrumentIndex = Object.entries(index).reduce((acc, [category, instrumentFiles]) => {
		Object.keys(instrumentFiles).forEach(name => {
			acc[category as Category].push({ name, category: category as Category });
		});
		return acc;
	}, getDefaultIndex());

	return (
		<div class={classes.sidebarLayout}>
			<div class={classnames(classes.overflow, classes.left)}>
				<InstrumentPicker index={instrumentIndex} onPick={(category, name) => {
					instrument.value = { category, name };
				}} />
				<UserInstrumentPicker
					onDelete={id => {
						if (userInstrument.value.id == id) userInstrument.value = getDefaultInstrument();
					}}
					onPick={(category, name, id) => userInstrument.value = { category, name, id }}
				/>
			</div>
			<div class={classes.content}>
				<h1>{instrument.value.name}</h1>
				<div class={classes.overflow}>
					<InstrumentPlayer
						instrument={instrument.value}
						files={index?.[instrument.value.category]?.[instrument.value.name] ?? []}
					/>
				</div>
			</div>
			<div class={classnames(classes.overflow, classes.right)}>
				<InstrumentBuilder instrument={userInstrument.value} />
			</div>
		</div>
	);
}
