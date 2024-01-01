import { MidiNoteInput } from './note-midi.js';
import { Midi, isBlack, parseNoteNoFail } from '../lib/note.js';
import { useEffect, useState, useRef } from 'preact/hooks';
import { Key, PianoNote } from './key.js';
import { keys } from '../settings.js';
import classes from './piano.css';

interface PianoProps {
	onPress: (note: PianoNote) => void;
	onRelease?: (midi: Midi) => void;
	autofocus: boolean;
	loading: boolean;
};

type Notes = { [midi: Midi]: boolean };
type Keymap = { [key: string]: number };

function clamp(n: number, min: number, max: number) {
	if (n < min) return min;
	if (n > max) return max;
	return n;
}

function createNotes(from: Midi, to: Midi): Notes {
	const res = {} as Notes;
	for (let i = from; i < to; i++) res[i] = false;
	return res;
}

function createKeymap(from: Midi, to: Midi): Keymap {
	var res: Keymap = {};
	var key_i = isBlack(from) ? 0 : 1;
	type Key = keyof typeof keys.value;
	const hotkeys = Object.keys(keys.value) as Key[];
	for (let i = from; i < to; i++) {
		let key = hotkeys[key_i];
		const cond = isBlack(i) ? (k: Key) => !keys.value[k] : (k: Key) => keys.value[k];
		while (key && cond(key)) {
			key = hotkeys[++key_i];
		}
		if (key) res[key] = i;
		if (key_i++ > hotkeys.length) break;
	}
	return res;
}

export function Piano({ onPress, onRelease, autofocus, loading }: PianoProps) {
	const [from, setFrom] = useState(parseNoteNoFail('C3').midi as number);
	const [to, setTo] = useState(parseNoteNoFail('C5').midi as number);
	const [notes, setNotes] = useState(createNotes(from, to));
	const [keymap, setKeymap] = useState(createKeymap(from, to));
	const list = useRef<HTMLOListElement | null>(null);

	function keyDown(event: KeyboardEvent) {
		let dir = 0;
		if (event.key == 'z') dir = -12;
		if (event.key == 'x') dir = 12;
		if (dir !== 0) {
			setFrom(clamp(from + dir, 0, 128));
			setTo(clamp(to+ dir, 0, 128));
		}
		if (!(event.key in keymap)) return;
		const key = event.key as keyof typeof keymap;
		onPress({ midi: keymap[key], velocity: 100 });
	}

	function keyUp(event: KeyboardEvent) {
		if (!(event.key in keymap)) return;
		const key = event.key as keyof typeof keymap;
		onRelease && onRelease(keymap[key]);
	}

	useEffect(() => {
		if (autofocus && list.current) list.current.focus();
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
			<ol
				ref={list}
				class={`${classes.piano} ${loading ? classes.loading : ''}`}
				tabindex={0}
				onKeyDown={keyDown}
				onKeyUp={keyUp}
			>
				{Object.keys(notes).map(n =>
					<Key
						onPress={onPress}
						onRelease={onRelease}
						midi={+n}
						hotkey={hotkeys[n] || ''}
					/>
				)}
			</ol>
			{!loading ? null :
				<div
					class={classes.overlay}
					style={{ width: list.current?.scrollWidth }}
				>
					Loading...
				</div>
			}
			<div>
				<MidiNoteInput label="Start" value={from} setValue={setFrom} />
				<MidiNoteInput label="End" value={to} setValue={setTo} />
			</div>
		</>
	);
}
