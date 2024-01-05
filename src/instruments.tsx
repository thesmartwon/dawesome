import { Instrument, Category } from './instrument.js';
import { useState, useEffect } from 'preact/hooks';
import classes from './main.css';

type Index = {
	[k in Category]: {
		[k: string]: string[];
	}
};

export function Instruments() {
	const [category, setCategory] = useState<Category>('percussion');
	const [name, setName] = useState('');
	const [index, setIndex] = useState<Index>({
		percussion: {},
		strings: {},
		wind: {},
		electronic: {},
	});

	useEffect(() => {
		fetch(SAMPLE_URL + '/index.json').then(res => res.json()).then(i => setIndex(i));
	}, []);

	return (
		<>
			<div class={classes.sidebar}>
				{Object.entries(index).map(([category, instruments], i) =>
					<details open={i == 0}>
						<summary>{category}</summary>
						<ul>
							{Object.keys(instruments).map(name =>
								<li>
									<button onClick={() => {
										setCategory(category as Category);
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
						files={index[category][name]}
						autofocus={true}
					/>}
			</div>
		</>
	);
}
