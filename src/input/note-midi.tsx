import { parseNote, Midi } from '../lib/note.js';
import { useState, StateUpdater } from 'preact/hooks';
import classes from './note.css';
import { midiToNoteName } from '@tonaljs/midi';

export interface MidiNoteProps {
	label: string;
	value: Midi;
	setValue: StateUpdater<Midi>;
};
export function MidiNoteInput({ label, value, setValue }: MidiNoteProps) {
	const [invalid, setInvalid] = useState(false);
	const parsed = parseNote(midiToNoteName(value));

	return (
		<>
			<label id={label}>{label}</label>
			<input
				class={`${classes.note} ${invalid ? classes.invalid : ''}`}
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
		</>
	);
}
