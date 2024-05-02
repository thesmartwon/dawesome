import { onMount, createSignal, batch, Show, Switch, Match, createMemo, onCleanup } from 'solid-js';
import { Header, InstrumentSelect, Piano, Drums } from '../components';
import { PitchedPlayer, NoteUrlGain, Dynamic, dynamicToGain } from '../audio/PitchedPlayer';
import { Player } from '../audio/Player';
import { Note } from 'tonal';
import styles from './Play.module.css';

type AnyPlayer = PitchedPlayer | Player;

const players = {} as { [id: string]: AnyPlayer };

function createPlayer(index: SampleIndex, category: string, name: string): AnyPlayer {
	if (players[name]) return players[name];

	const samples = index[category][name];
	switch (category) {
		case 'strings': {
			const res = new PitchedPlayer();

			const noteUrls: NoteUrlGain[] = [];
			samples.forEach(sample => {
				const note = sample.substring(3);
				const freq = Note.freq(note);
				if (!freq) {
					console.warn('could not parse frequency for sample', sample);
					return;
				}
				const url = `${SAMPLE_BASE}/strings/${name}/${encodeURIComponent(sample)}.ogg`;
				const dynamic = sample.substring(0, 2).toLowerCase() as Dynamic;
				const gain = dynamicToGain(dynamic);
				noteUrls.push({ freq, url, gain });
			});
			res.loadLayers(noteUrls);
			players[name] = res;
			return res;
		}
		case 'percussion': {
			const res = new Player();
			samples.forEach(s =>
				res.loadUrl(s, `${SAMPLE_BASE}/${category}/${name}/${s}.ogg`)
			);
			players[name] = res;
			return res;
		}
		default:
			throw new Error ('dunno how to load instrument in ' + category);
	}
}

interface InstrumentProps {
	name: string;
	player?: Player;
};
function Instrument(props: InstrumentProps) {
	return (
		<Switch>
			<Match when={props.player instanceof PitchedPlayer}>
				<Piano player={props.player as PitchedPlayer} />
			</Match>
			<Match when={props.player instanceof Player}>
				<Drums player={props.player as Player} name={props.name} />
			</Match>
		</Switch>
	);
}

export interface PlayProps {
	index?: SampleIndex;
};
export function Play(props: PlayProps) {
	const [drawerOpen, setDrawerOpen] = createSignal<boolean>(false);
	const [category, setCategory] = createSignal('strings');
	const [name, setName] = createSignal('Splendid Grand Piano');

	function onKeyDown(ev: KeyboardEvent) {
		if (ev.key == 'Escape' && drawerOpen()) {
			ev.preventDefault();
			setDrawerOpen(false);
		}
	}

	onMount(() => {
		document.addEventListener('keydown', onKeyDown);
		onCleanup(() => document.removeEventListener('keydown', onKeyDown));
	});

	const player = createMemo(() => {
		if (!props.index) return;

		return createPlayer(props.index, category(), name());
	});

	return (
		<>
			<Header onToggle={() => setDrawerOpen(!drawerOpen())} />
			<Show when={drawerOpen()}>
				<aside class={styles.drawer}>
					<InstrumentSelect
						index={props.index}
						onSelect={(category, name) => {
							batch(() => {
								setCategory(category);
								setName(name);
								setDrawerOpen(false);
							});
						}}
					/>
				</aside>
			</Show>
			<main class={styles.main}>
				<Instrument player={player()} name={name()} />
			</main>
		</>
	);
}
