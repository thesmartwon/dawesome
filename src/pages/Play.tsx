import { onMount, createSignal, For, createEffect } from 'solid-js';
import { Header, PianoCanvas, ContextMenu, Menu, MenuItem } from '../components';
import styles from './Play.module.css';

type Input = MIDIInput | undefined;

export function Play() {
	const [inputs, setInputs] = createSignal<Input[]>([]);
	const [input, setInput] = createSignal<Input>();
	var inputRef: HTMLCanvasElement | undefined;

	onMount(() => {
		if (!inputRef) return;

		function onKeyDown(note: string, velocity: number) {
		}

		function onKeyUp(note: string) {
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
					<canvas class={styles.display}>
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
