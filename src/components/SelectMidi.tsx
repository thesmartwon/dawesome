import { onMount, createSignal, For, createEffect, onCleanup } from 'solid-js';
import { Menu, MenuItem } from '../components';

type Input = MIDIInput | undefined;

interface SelectMidiProps {
	onSelect(input: Input): void;
};
export function SelectMidi(props: SelectMidiProps) {
	const [inputs, setInputs] = createSignal<Input[]>([]);
	const [input, setInput] = createSignal<Input>();
	const [midi, setMidi] = createSignal<MIDIAccess | undefined>();

	createEffect(() => props.onSelect(input()));

	function updateInputs() {
		const m = midi();
		if (!m) return;
		const res: Input[] = [undefined];
		for (const entry of m.inputs.values()) res.push(entry);
		setInputs(res);
	}
	onMount(() => {
		if (!('requestMIDIAccess' in navigator)) return;
		navigator.requestMIDIAccess().then(m => {
			m.addEventListener('statechange', updateInputs);
			setMidi(m); // to later removeEventListener
			updateInputs();
		});
	});
	onCleanup(() => {
		const m = midi();
		if (!m) return;
		m.removeEventListener('statechange', updateInputs);
	});

	return (
		<>
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
		</>
	);
}
