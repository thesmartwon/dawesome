import { useState, useEffect } from 'preact/hooks';
import { signal } from '@preact/signals';

export const midi = signal(null as null | {
	input: MIDIInput,
});

export function MIDISelect() {
	const [inputs, setInputs] = useState<MIDIInput[]>([]);

	useEffect(() => {
		navigator.requestMIDIAccess().then(m => {
			if (m.inputs.size == 0) return;
			const entries: MIDIInput[] = [];
			for (const entry of m.inputs.values()) entries.push(entry);
			setInputs(entries);
			midi.value = {
				input: entries[entries.length - 1],
			};
		});
	}, []);

	return (
		<>
			input
			<select value={midi.value?.input.id}>
				{inputs.map(i => (
					<option value={i.id}>{i.name}</option>
				))}
			</select>
		</>
	);
}
