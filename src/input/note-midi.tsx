import { parseNote, Midi } from '../lib/note.js';
import { useState } from 'preact/hooks';
import classes from './note.css';
import { midiToNoteName } from '@tonaljs/midi';
import { classnames } from '../classnames.js';

export interface MidiNoteProps {
	label: string;
	value: Midi;
	setValue: (n: number) => void;
};
export function MidiNoteInput({ label, value, setValue }: MidiNoteProps) {
	const [invalid, setInvalid] = useState(false);
	const parsed = parseNote(midiToNoteName(value));

	return (
		<label>
			{label}
			<input
				class={classnames(classes.note, invalid && classes.invalid)}
				name={label}
				value={parsed.name}
				onChange={ev => {
					const parsed = parseNote(ev.currentTarget.value);
					if (parsed.empty || parsed.midi == null) {
						setInvalid(true);
					} else {
						setInvalid(false);
						setValue(parsed.midi as number);
					}
				}}
			/>
			</label>
	);
}
