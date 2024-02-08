import { createStore, reconcile } from 'solid-js/store';
import { For, createEffect } from 'solid-js';
import { Player, Samples } from '../audio/Player';

import styles from './Drums.module.css';

export interface DrumsProps {
	name: string;
	player: Player;
	midi?: MIDIInput;
};
export function Drums(props: DrumsProps) {
	const [samples, setSamples] = createStore<Samples>({});
	createEffect(() => {
		setSamples(reconcile(props.player.samples));
		props.player.onLoaded = () => {
			setSamples(reconcile(props.player.samples));
		};
	});

	return (
		<div class={styles.grid}>
			{props.name}
			<For each={Object.entries(samples)}>
				{([name, buffer]) =>
					<button
						disabled={!buffer}
						onClick={() => props.player.play(name)}
					>
						{name}
					</button>
				}
			</For>
		</div>
	);
}
