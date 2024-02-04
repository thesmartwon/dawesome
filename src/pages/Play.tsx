import { onMount, createSignal, For, createEffect, onCleanup } from 'solid-js';
import { Header, PianoCanvas, ContextMenu, Menu, MenuItem, PianoDisplayCanvas, SelectMidi } from '../components';
import { PitchedPlayer, NoteUrlGain, Dynamic, dynamicToGain } from '../audio/PitchedPlayer';
import { Note } from 'tonal';
import styles from './Play.module.css';

export function Play() {
	const [instrument, setInstrument] = createSignal<PitchedPlayer | undefined>();
	const [inputCanvas, setInputCanvas] = createSignal<PianoCanvas | undefined>();

	let inputRef: HTMLCanvasElement | undefined;
	let displayRef: HTMLCanvasElement | undefined;

	onMount(async () => {
		const instrument = new PitchedPlayer();

		const base = SAMPLE_BASE;
		const index = await fetch(`${base}/index.json`).then(res => res.json()) as any;
		const sampleList = index.strings['Splendid Grand Piano'] as string[];
		const noteUrls: NoteUrlGain[] = [];
		sampleList.forEach(sample => {
			const note = sample.substring(3);
			const freq = Note.freq(note);
			if (!freq) {
				console.warn('could not parse frequency for sample', sample);
				return;
			}
			const url = `${base}/strings/Splendid Grand Piano/${encodeURIComponent(sample)}.ogg`;
			const dynamic = sample.substring(0, 2).toLowerCase() as Dynamic;
			const gain = dynamicToGain(dynamic);
			noteUrls.push({ freq, url, gain });
		});

		setInstrument(instrument);
		await instrument.loadLayers(noteUrls);
	});

	createEffect(() => {
		if (!inputRef || !displayRef || !instrument()) return;

		function onKeyDown(note: string, velocity: number) {
			instrument()?.playNote(note, Math.min(velocity, 100));
			display.keyDown(note, velocity);
		}

		function onKeyUp(note: string) {
			instrument()?.stopNote(note);
			display.keyUp(note);
		}

		const input = new PianoCanvas(inputRef, onKeyDown, onKeyUp);
		const display = new PianoDisplayCanvas(displayRef, input);

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
			<Header />
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
