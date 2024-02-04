import { onMount, createSignal, createEffect, onCleanup, Show } from 'solid-js';
import { Header, PianoCanvas, ContextMenu, Menu, MenuItem, PianoDisplayCanvas, SelectMidi, InstrumentSelect } from '../components';
import { PitchedPlayer, NoteUrlGain, Dynamic, dynamicToGain } from '../audio/PitchedPlayer';
import { Note } from 'tonal';
import styles from './Play.module.css';

function createPlayer(index: SampleIndex, category: string, name: string): PitchedPlayer {
	switch (category) {
		case 'strings':
			const res = new PitchedPlayer();

			const sampleList = index[category][name] as string[];
			const noteUrls: NoteUrlGain[] = [];
			sampleList.forEach(sample => {
				const note = sample.substring(3);
				const freq = Note.freq(note);
				if (!freq) {
					console.warn('could not parse frequency for sample', sample);
					return;
				}
				const url = `${SAMPLE_BASE}/strings/Splendid Grand Piano/${encodeURIComponent(sample)}.ogg`;
				const dynamic = sample.substring(0, 2).toLowerCase() as Dynamic;
				const gain = dynamicToGain(dynamic);
				noteUrls.push({ freq, url, gain });
			});
			res.loadLayers(noteUrls);
			return res;
		default:
			throw new Error ('dunno how to load instrument in ' + category);
	}
}

type Player = PitchedPlayer;

function createCanvases(player: Player, inputRef: HTMLCanvasElement, displayRef: HTMLCanvasElement) {
	if (player instanceof PitchedPlayer) {
		function onKeyDown(note: string, velocity: number) {
			player.playNote(note, velocity);
			display.playNote(note, velocity);
		}

		function onKeyUp(note: string) {
			player.stopNote(note);
			display.stopNote(note);
		}

		const input = new PianoCanvas(inputRef, onKeyDown, onKeyUp);
		const display = new PianoDisplayCanvas(displayRef, input);

		return { input, display }
	}
	throw new Error('dunno how to init canvases');
}

export interface PlayProps {
	index?: SampleIndex;
};
export function Play(props: PlayProps) {
	const [player, setPlayer] = createSignal<Player | undefined>();
	const [inputCanvas, setInputCanvas] = createSignal<PianoCanvas | undefined>();
	const [drawerOpen, setDrawerOpen] = createSignal<boolean>(false);
	const [headerHeight, setHeaderHeight] = createSignal(0);
	const [category, setCategory] = createSignal('strings');
	const [name, setName] = createSignal('Splendid Grand Piano');

	let inputRef: HTMLCanvasElement | undefined;
	let displayRef: HTMLCanvasElement | undefined;
	let headerRef: HTMLElement | undefined;

	onMount(() => {
		if (!headerRef) return;

		const height = headerRef.getBoundingClientRect().height;
		const margin = getComputedStyle(headerRef).margin;
		setHeaderHeight(height + parseFloat(margin) * 2);
	});

	createEffect(() => {
		if (!props.index) return;

		setPlayer(createPlayer(props.index, category(), name()));
	});

	createEffect(() => {
		const p = player();
		if (!inputRef || !displayRef || !p) return;

		const { input } = createCanvases(p, inputRef, displayRef);

		setInputCanvas(input);
		onCleanup(() => input.removeListeners());
	});

	const menu = (
		<Menu>
			<MenuItem>
				<SelectMidi onSelect={d => inputCanvas()?.setMidiInput(d)} />
			</MenuItem>
		</Menu>
	);

	// onOpen={listMidi}
	return (
		<>
			<Header ref={headerRef} onToggle={() => setDrawerOpen(!drawerOpen())} />
			<Show when={drawerOpen()}>
				<aside class={styles.drawer} style={{ 'margin-top': `${headerHeight()}px` }}>
					<InstrumentSelect
						index={props.index}
						onSelect={(category, name) => {
							setCategory(category);
							setName(name);
						}}
					/>
				</aside>
			</Show>
			<main>
				<ContextMenu menu={menu} class={styles.main}>
					<canvas ref={displayRef} class={styles.display}>
						No 2d context available
					</canvas>
					<canvas ref={inputRef} class={styles.input}>
						No 2d context available
					</canvas>
				</ContextMenu>
			</main>
		</>
	);
}
