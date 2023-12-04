import { Player, Category, InstrumentPlayer } from './instrument.js';
import { useEffect, useState } from 'preact/hooks';
import classes from './instruments.css';

type Index = {
	[k in Category]: {
		[k2: string]: Player
	}
};

export function Instruments() {
	const [index, setIndex] = useState<Index>({} as Index);
	const [name, setName] = useState('');
	const [category, setCategory] = useState<Category>('percussion');
	const [instrument, setInstrument] = useState<Player | null>(null);

	useEffect(() => {
		fetch('/instruments.json')
			.then(res => res.json())
			.then(setIndex);
	}, []);

	return (
		<div class={classes.instruments}>
			<div class={classes.selector}>
				{Object.keys(index).sort().map((k, i) => (
					<details open={i == 0}>
						<summary>{k}</summary>
						<ul>
							{Object.entries(index[k as Category]).map(([k2, v2]) => (
								<li>
									<button onClick={() => {
										setCategory(k as Category);
										setName(k2);
										setInstrument(v2);
									}}>{k2}</button>
								</li>
							))}
						</ul>
					</details>
				))}
			</div>
			<div class={classes.player}>
				{instrument && <InstrumentPlayer name={name} category={category} instrument={instrument} />}
			</div>
		</div>
	);
}
