import { useState, useEffect, StateUpdater } from 'preact/hooks';

export type Input = MIDIInput | undefined;

export interface MIDISelectProps {
	value: Input;
	setValue: StateUpdater<Input>;
};

export function MIDISelect({ value, setValue }: MIDISelectProps) {
	const [inputs, setInputs] = useState<Input[]>([]);

	function loadInputs() {
		navigator.requestMIDIAccess().then(m => {
			const inputs: Input[] = [undefined];
			for (const entry of m.inputs.values()) inputs.push(entry);
			setInputs(inputs);
		});
	}
	useEffect(loadInputs, []);

	return (
		<div>
			MIDI Device
			<select
				value={value?.id}
				name="midi device"
				onChange={ev => {
					const input = inputs.find(i => i?.id == ev.currentTarget.value);
					setValue(input);
				}}
				onClick={loadInputs}
			>
				{inputs.map(input =>
					<option value={input?.id}>{input ? input.name : 'None'}</option>
				)}
			</select>
		</div>
	);
}


