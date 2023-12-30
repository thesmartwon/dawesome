import { midi, MIDISelect } from './midi.js';
import { Midi, Frequency, FrequencyClass } from 'tone';
import { Note, isBlack } from '../note.js';
import { Instrument } from 'tone/Tone/instrument/Instrument.js';
import { useEffect, useState, useRef } from 'preact/hooks';
import { Key } from './key.js';
import classes from './piano.css';

interface PianoProps {
	instrument: Instrument<any>;
	autofocus: boolean;
}
type Notes = { [key in Note]: boolean };
type Keymap = { [key: string]: Note };

function clamp(n: number, min: number, max: number) {
	if (n < min) return min;
	if (n > max) return max;
	return n;
}

const min = Frequency('C0').toFrequency();
const max = Frequency('C12').toFrequency();

function isNice(n: FrequencyClass): boolean {
	const f = n.toFrequency();
	return f >= min && f <= max;
}

function createNotes(from: Note, to: Note): Notes {
	const res = {} as Notes;
	for (let i = Frequency(from); i < Frequency(to); i = i.transpose(1)) res[i.toNote()] = false;
	return res;
}

function createKeymap(from: Note, to: Note): Keymap {
	var res: Keymap = {};
	var key_i = isBlack(Frequency(from).toNote()) ? 0 : 1;
	for (
		let i = Frequency(from);
		i < Frequency(to);
		i = i.transpose(1)
	) {
		const n = i.toNote();
		let key = keys[key_i];
		const cond = isBlack(n) ? (k: string) => !blackKeys.includes(k) : (k: string) => blackKeys.includes(k);
		while (key && cond(key)) {
			key = keys[++key_i];
		}
		if (key) res[key] = n;
		if (key_i++ > keys.length) break;
	}
	return res;
}

const keys = [
	'q',
	'a',
	'w',
	's',
	'e',
	'd',
	'r',
	'f',
	't',
	'g',
	'y',
	'h',
	'u',
	'j',
	'i',
	'k',
	'o',
	'l',
	'p',
	';',
	'[',
	"'",
	']',
];
const blackKeys = [
	'q',
	'w',
	'e',
	'r',
	't',
	'y',
	'u',
	'i',
	'o',
	'p',
	'[',
	']',
];

export function Piano({ instrument, autofocus }: PianoProps) {
	const [from, setFrom] = useState<Note>('C3');
	const [to, setTo] = useState<Note>('C5');
	const [notes, setNotes] = useState(createNotes(from, to));
	const [keymap, setKeymap] = useState(createKeymap(from, to));
	const list = useRef<HTMLOListElement | null>(null);

	function attack(note: Note, velocity: number) {
		if (!(note in notes)) return;
		instrument.triggerAttack(note, undefined, velocity);
		notes[note] = true;
		setNotes({...notes});
	}

	function release(note: Note) {
		if (!(note in notes)) return;
		instrument.triggerRelease(note);
		notes[note] = false;
		setNotes({...notes});
	}

	function playMidiNote(event: Event) {
		const ev = event as MIDIMessageEvent;
		const [pressed, midiNote, velocity] = ev.data;
		const note: Note = Midi(midiNote).toNote();
		if (pressed == 144) attack(note, velocity / 100);
		if (pressed == 128) release(note);
	}
	useEffect(() => {
		const input = midi.value.input;
		input?.addEventListener('midimessage', playMidiNote);
		return () => input?.removeEventListener('midimessage', playMidiNote);
	}, [midi.value]);

	function playNote(event: KeyboardEvent) {
		let dir = 0;
		if (event.key == 'z') dir = -1;
		if (event.key == 'x') dir = 1;
		if (dir !== 0) {
			const newFrom = Frequency(from).transpose(dir * 12);
			const newTo = Frequency(to).transpose(dir * 12);
			if (isNice(newFrom) && isNice(newTo)) {
				setFrom(newFrom.toNote());
				setTo(newTo.toNote());
			}
		}
		if (!(event.key in keymap)) return;
		const key = event.key as keyof typeof keymap;
		const note = keymap[key];
		if (notes[note]) return;
		attack(note, 1);
	}

	function endNote(event: KeyboardEvent) {
		if (!(event.key in keymap)) return;
		const key = event.key as keyof typeof keymap;
		release(keymap[key]);
	}

	useEffect(() => {
		if (list.current && autofocus) list.current.focus();
	}, [list.current]);

	useEffect(() => {
		setNotes(createNotes(from, to));
		setKeymap(createKeymap(from, to));
	}, [from, to]);

	const hotkeys = Object.entries(keymap).reduce((acc, [k, v]) => {
		acc[v] = k;
		return acc;
	}, {} as { [k: string]: string });

	return (
		<>
			<div>
				<Note label="Start" value={from} setValue={setFrom} />
				<Note label="End" value={to} setValue={setTo} />
				<MIDISelect />
			</div>
			<ol
				ref={list}
				class={classes.piano}
				tabindex={0}
				onKeyDown={playNote}
				onKeyUp={endNote}
			>
				{Object.entries(notes).map(([n, held]) => (
					<Key
						instrument={instrument}
						n={n as Note}
						hotkey={hotkeys[n] || ''}
						held={held}
					/>)
				)}
			</ol>
		</>
	);
}
