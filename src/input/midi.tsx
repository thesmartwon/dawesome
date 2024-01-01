import { useState, useEffect, StateUpdater } from 'preact/hooks';

export type Input = MIDIInput | undefined;

export interface MIDISelectProps {
	value: Input;
	setValue: StateUpdater<Input>;
};

export function MIDISelect({ value, setValue }: MIDISelectProps) {
	const [inputs, setInputs] = useState<Input[]>([]);

	function loadInputs(setInitial = false) {
		navigator.requestMIDIAccess().then(m => {
			const inputs: Input[] = [undefined];
			for (const entry of m.inputs.values()) inputs.push(entry);
			setInputs(inputs);
			if (setInitial) setValue(inputs[inputs.length - 1]);
		});
	}
	useEffect(() => loadInputs(true), []);

	return (
		<>
			MIDI Device
			<select
				value={value?.id}
				onChange={ev => {
					const input = inputs.find(i => i?.id == ev.currentTarget.value);
					setValue(input);
				}}
				onClick={() => loadInputs(false)}
			>
				{inputs.map(input =>
					<option value={input?.id}>{input ? input.name : 'None'}</option>
				)}
			</select>
		</>
	);
}


