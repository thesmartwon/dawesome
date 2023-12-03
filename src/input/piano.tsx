import { midi, MIDISelect } from './midi.js';
import { Midi } from 'tone';
import { Instrument } from 'tone/Tone/instrument/Instrument.js';
import { Note } from '../note.js';
import { useEffect } from 'preact/hooks';
import { Key } from './key.js';
import classes from './piano.css';

interface PianoProps {
	instrument: Instrument<any>;
}

export function Piano({ instrument }: PianoProps) {
	function playNote(event: Event) {
		const ev = event as MIDIMessageEvent;
		const [pressed, midiNote, velocity] = ev.data;
		const note: Note = Midi(midiNote).toNote();
		if (pressed == 144) instrument.triggerAttack(note, undefined, velocity / 100);
		if (pressed == 128) instrument.triggerRelease(note);
	}
	useEffect(() => {
		midi.value?.input.addEventListener('midimessage', playNote);
		return () => midi.value?.input.removeEventListener('midimessage', playNote);
	}, [midi.value]);

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
	const notes: Note[] = [];
	for (let i = 0; i < 5; i++) {
		for (let j = 0; j < 12; j++) {
			const note: Note = `${scale[j]}${i + 1}` as Note;
			notes.push(note);
		}
	}

	return (
		<>
			<MIDISelect />
			<ol class={classes.piano}>
				{notes.map(n => <Key instrument={instrument} n={n} />)}
			</ol>
		</>
	);
}
