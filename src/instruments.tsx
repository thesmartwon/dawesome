import type { Index, Category } from './types.js';
import { InstrumentPlayer } from './instrument.js';
import { useState } from 'preact/hooks';
import classes from './main.css';

export interface InstrumentsProps {
	index: Index;
}

export function Instruments({ index }: InstrumentsProps) {
	const [category, setCategory] = useState<Category>('percussion');
	const [name, setName] = useState('');

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
				{name}
				<InstrumentPlayer
					category={category}
					name={name}
					files={index?.[category]?.[name] ?? []}
				/>
			</div>
		</>
	);
}
