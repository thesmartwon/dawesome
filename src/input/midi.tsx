import { useEffect } from 'preact/hooks';
import { signal } from '@preact/signals';

export const midi = signal({
	inputs: [] as MIDIInput[],
	input: undefined as MIDIInput | undefined,
});

export function MIDISelect() {
	useEffect(() => {
		if (midi.value.inputs.length > 0) return;
		navigator.requestMIDIAccess().then(m => {
			const inputs: MIDIInput[] = [];
			for (const entry of m.inputs.values()) inputs.push(entry);
			midi.value = {
				inputs,
				input: inputs[inputs.length - 1],
			};
		});
	}, []);

	return (
		<>
			input
			<select value={midi.value.input?.id} onChange={ev => {
				const input = midi.value.inputs.find(i => i.id == ev.currentTarget.value);
				midi.value = { ...midi.value, input };
			}}>
				{midi.value.inputs.map(i => (
					<option value={i.id}>{i.name}</option>
				))}
			</select>
		</>
	);
}
