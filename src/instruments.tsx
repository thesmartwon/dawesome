import type { Index, Category, UserIndex } from './types.js';
import { InstrumentPlayer } from './instrument.js';
import { InstrumentBuilder } from './instrument-builder.js';
import { useState } from 'preact/hooks';
import { classnames } from './helpers.js';
import { Signal } from '@preact/signals';
import classes from './instruments.css';

export interface InstrumentsProps {
	index: Index;
	userIndex: Signal<UserIndex>;
}

export function Instruments({ index, userIndex }: InstrumentsProps) {
	const [category, setCategory] = useState<Category>('percussion');
	const [name, setName] = useState('');
	const [userName, setUserName] = useState(Object.keys(userIndex.value)[0]);

	return (
		<div class={classes.sidebarLayout}>
			<div class={classnames(classes.sidebar, classes.left)}>
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
				<details open>
					<summary>User instruments</summary>
					<ul>
						{Object.keys(userIndex.value).map(name =>
							<li class={classes.userInstrument}>
								<button onClick={() => setUserName(name)}>
									{name}
								</button>
								<button onClick={() => {
									delete userIndex.value[name];
									userIndex.value = { ...userIndex.value };
									if (userName === name) setUserName(Object.keys(userIndex.value)[0]);
								}}>
									x
								</button>
							</li>
						)}
						<li>
							<button onClick={() => {
								let newName = '';
								for (let i = 1; newName in userIndex.value || newName.length === 0; i++) {
									newName = 'Custom percussion ' + i;
								}
								userIndex.value = { ...userIndex.value, [newName]: {} };
								setUserName(newName);
							}}>
								New
							</button>
						</li>
					</ul>
				</details>
			</div>
			<div class={classes.content}>
				<h1>{name}</h1>
				<div class={classes.overflow}>
					<InstrumentPlayer
						category={category}
						name={name}
						files={index?.[category]?.[name] ?? []}
					/>
				</div>
			</div>
			{category === 'percussion' &&
				<div class={classnames(classes.sidebar, classes.right)}>
					<InstrumentBuilder name={userName} userIndex={userIndex} />
				</div>
			}
		</div>
	);
}
