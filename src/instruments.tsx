import { Instrument, Category } from './instrument.js';
import { useState } from 'preact/hooks';
import { getDrumMachineNames } from 'smplr';
import classes from './main.css';

type Index = {
	[k in Category]: string[];
};

const index: Index = {
	'percussion': getDrumMachineNames(),
	'strings': ['Splendid Grand Piano'],
	'wind': [],
	'electronic': [],
};

export function Instruments() {
	const [category, setCategory] = useState<Category>('percussion');
	const [name, setName] = useState('');

	return (
		<>
			<div class={classes.sidebar}>
				{Object.entries(index).map(([k, names], i) =>
					<details open={i == 0}>
						<summary>{k}</summary>
						<ul>
							{names.map(name =>
								<li>
									<button onClick={() => {
										setCategory(k as Category);
										setName(name);
									}}>
										{name}
									</button>
								</li>
							)}
						</ul>
					</details>
				)}
			</div>
			<div class={classes.content}>
				{name &&
					<Instrument
						category={category}
						name={name}
						autofocus={true}
					/>}
			</div>
		</>
	);
}
