import { Note, parseNote } from '../lib/note.js';
import { useState, StateUpdater } from 'preact/hooks';
import classes from './note.css';

export interface NoteInputProps {
	label: string;
	value: Note;
	setValue: StateUpdater<Note>;
};
export function NoteInput({ label, value, setValue }: NoteInputProps) {
	const [invalid, setInvalid] = useState(false);

	return (
		<>
			<label id={label}>{label}</label>
			<input
				class={`${classes.note} ${invalid ? classes.invalid : ''}`}
				name={label}
				value={value.name}
				onChange={ev => {
					const parsed = parseNote(ev.currentTarget.value);
					if (parsed.empty) {
						setInvalid(true);
					} else {
						setInvalid(false);
						setValue(parsed);
					}
				}}
			/>
		</>
	);
}

