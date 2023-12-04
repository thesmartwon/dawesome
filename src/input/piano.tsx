import { midi, MIDISelect } from './midi.js';
import { Midi } from 'tone';
import { Note } from '../note.js';
import { Instrument } from 'tone/Tone/instrument/Instrument.js';
import { useEffect, useState } from 'preact/hooks';
import { Key } from './key.js';
import classes from './piano.css';

interface PianoProps {
	instrument: Instrument<any>;
}
type Notes = {
	[key in Note]: boolean
};

function createNotes(): Notes {
	const scale = [
		'C',
		'C#',
		'D',
		'D#',
		'E',
		'F',
		'F#',
		'G',
		'G#',
		'A',
		'A#',
		'B',
	];
	const res = {} as Notes;
	for (let i = 0; i < 5; i++) {
		for (let j = 0; j < 12; j++) {
			const note: Note = `${scale[j]}${i + 1}` as Note;
			res[note] = false;
		}
	}

	return res;
}

export function Piano({ instrument }: PianoProps) {
	const [notes, setNotes] = useState(createNotes());

	function playNote(event: Event) {
		const ev = event as MIDIMessageEvent;
		const [pressed, midiNote, velocity] = ev.data;
		const note: Note = Midi(midiNote).toNote();
		if (pressed == 144) {
			instrument.triggerAttack(note, undefined, velocity / 100);
			notes[note] = true;
			setNotes({...notes});
		}
		if (pressed == 128) {
			instrument.triggerRelease(note);
			notes[note] = false;
			setNotes({...notes});
		}
	}
	useEffect(() => {
		const input = midi.value.input;
		input?.addEventListener('midimessage', playNote);
		return () => input?.removeEventListener('midimessage', playNote);
	}, [midi.value]);


	return (
		<>
			<MIDISelect />
			<ol class={classes.piano}>
				{Object.entries(notes).map(([n, held]) => (
					<Key instrument={instrument} n={n as Note} held={held} />)
				)}
			</ol>
		</>
	);
}
