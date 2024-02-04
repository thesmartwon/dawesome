import { onMount, createSignal, For, createEffect } from 'solid-js';
import { Menu, MenuItem } from '../components';

type Input = MIDIInput | undefined;

async function listInputs(): Promise<Input[]> {
	const res: Input[] = [undefined];
	const m = await navigator.requestMIDIAccess();
	for (const entry of m.inputs.values()) res.push(entry);
	return res;
}

interface SelectMidiProps {
	onSelect(input: Input): void;
};
export function SelectMidi(props: SelectMidiProps) {
	const [inputs, setInputs] = createSignal<Input[]>([]);
	const [input, setInput] = createSignal<Input>();

	createEffect(() => props.onSelect(input()));

	onMount(() => {
		listInputs().then(setInputs);
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
