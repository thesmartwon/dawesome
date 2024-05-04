import { onMount, createSignal, batch, Show, Switch, Match, createMemo, onCleanup } from 'solid-js';
import { Header, InstrumentSelect, Piano, Drums } from '../components';
import { Context, Sampler, Synth } from '../audio/index';
import styles from './Play.module.css';

type AnyPlayer = Sampler | Synth;

const players = {} as { [id: string]: AnyPlayer };

function createPlayer(ctx: Context, index: SampleIndex, category: string, name: string): AnyPlayer {
	if (players[name]) return players[name];

	const samples = index[category][name];
	switch (category) {
		case 'strings': {
			const res = new Synth(ctx);
			players[name] = res;
			return res;
		}
		case 'percussion': {
			const res = new Sampler(ctx);
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
	player?: AnyPlayer;
};
function Instrument(props: InstrumentProps) {
	return (
		<Switch>
			<Match when={props.player instanceof Synth}>
				<Piano player={props.player as Synth} />
			</Match>
			<Match when={props.player instanceof Sampler}>
				<Drums player={props.player as Sampler} name={props.name} />
			</Match>
		</Switch>
	);
}

export interface PlayProps {
	index?: SampleIndex;
	ctx: Context;
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

		return createPlayer(props.ctx, props.index, category(), name());
	});

	return (
		<>
			<Header ctx={props.ctx} onToggle={() => setDrawerOpen(!drawerOpen())} />
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
