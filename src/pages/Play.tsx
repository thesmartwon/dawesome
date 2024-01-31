import { onMount, createSignal, For, createEffect } from 'solid-js';
import { Header, PianoCanvas, ContextMenu, Menu, MenuItem } from '../components';
import { PitchedPlayer, NoteUrlGain, Dynamic, dynamicToGain } from '../audio/PitchedPlayer';
import { Note } from 'tonal';
import styles from './Play.module.css';

type Input = MIDIInput | undefined;

export function Play() {
	const [inputs, setInputs] = createSignal<Input[]>([]);
	const [input, setInput] = createSignal<Input>();

	let inputRef: HTMLCanvasElement | undefined;
	let displayRef: HTMLCanvasElement | undefined;

	onMount(async () => {
		if (!inputRef) return;

		const instrument = new PitchedPlayer();

		const base = 'https://samples.dawesome.io'
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

		await instrument.loadLayers(noteUrls);

		function onKeyDown(note: string, velocity: number) {
			instrument.playNote(note, Math.min(velocity, 100));
		}

		function onKeyUp(note: string) {
			instrument.stopNote(note);
		}
		const pianoCanvas = new PianoCanvas(inputRef, onKeyDown, onKeyUp);
		createEffect(() => pianoCanvas.setMidiInput(input()));
	});

	function listMidi() {
		navigator.requestMIDIAccess().then(m => {
			const inputs: Input[] = [undefined];
			for (const entry of m.inputs.values()) inputs.push(entry);
			setInputs(inputs);
		});
	}

	const menu = (
		<Menu>
			<MenuItem>
				MIDI Device
				<Menu isFlyout>
					<For each={inputs()}>
						{i =>
							<MenuItem onClick={() => setInput(i)}>
								{i ? i.name : 'None'}
							</MenuItem>
						}
					</For>
				</Menu>
			</MenuItem>
		</Menu>
	);

	return (
		<>
			<Header />
			<main>
				<ContextMenu menu={menu} onOpen={listMidi} class={styles.main}>
					<div class={styles.display}>
						<canvas ref={displayRef}>
							No 2d context available
						</canvas>
					</div>
					<canvas ref={inputRef} class={styles.input}>
						No 2d context available
					</canvas>
				</ContextMenu>
			</main>
		</>
	);
}
