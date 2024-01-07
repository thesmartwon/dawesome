import { MidiNoteInput } from './note-midi.js';
import { Midi, isBlack } from '../lib/note.js';
import { useSignal, useComputed } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import { Key, PianoNote } from './key.js';
import { pianoKeys } from '../settings.js';
import classes from './piano.css';
import keyClasses from './key.css';

interface PianoProps {
	onPress: (note: PianoNote) => void;
	onRelease?: (midi: Midi) => void;
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
	type Key = keyof typeof pianoKeys.value;
	const hotkeys = Object.keys(pianoKeys.value) as Key[];
	for (let i = from; i < to; i++) {
		let key = hotkeys[key_i];
		const cond = isBlack(i) ? (k: Key) => !pianoKeys.value[k] : (k: Key) => pianoKeys.value[k];
		while (key && cond(key)) {
			key = hotkeys[++key_i];
		}
		if (key) res[key] = i;
		if (key_i++ > hotkeys.length) break;
	}
	return res;
}

export function Piano({ onPress, onRelease, loading }: PianoProps) {
	const container = useRef<HTMLDivElement | null>(null);

	const from = useSignal(48); // C3
	const to = useSignal(48 + 12); // C4
	const notes = useComputed(() => createNotes(from.value, to.value));
	const keymap = useComputed(() => createKeymap(from.value, to.value));

	function keyDown(event: KeyboardEvent) {
		if (event.repeat) return; // Not perfect, will repeat after ANOTHER key is pressed
		let dir = 0;
		if (event.key == 'z') dir = -12;
		if (event.key == 'x') dir = 12;
		if (dir !== 0) {
			from.value = clamp(from.value + dir, 0, 128);
			to.value = clamp(to.value + dir, 0, 128);
		}
		if (!(event.key in keymap.value)) return;
		const key = event.key as keyof typeof keymap.value;
		onPress({ midi: keymap.value[key], velocity: 100 });
	}

	function keyUp(event: KeyboardEvent) {
		if (!(event.key in keymap.value)) return;
		const key = event.key as keyof typeof keymap.value;
		onRelease && onRelease(keymap.value[key]);
	}

	useEffect(() => {
		document.addEventListener('keydown', keyDown);
		document.addEventListener('keyup', keyUp);
		return () => {
			document.removeEventListener('keydown', keyDown);
			document.removeEventListener('keyup', keyUp);
		};
	}, []);


	function resize() {
		const cont = container.current;
		if (!cont) return;

		let whiteKey = cont.querySelector('.' + keyClasses.white)?.getBoundingClientRect().width;
		let blackKey = cont.querySelector('.' + keyClasses.black)?.getBoundingClientRect().width;
		const space = cont.getBoundingClientRect().width;
		if (whiteKey && blackKey) {
			whiteKey += 1;
			blackKey += 1;
			let used = 0;
			let i = from.value;
			while (true) {
				if (isBlack(i)) used += blackKey / 2;
				else {
					if (isBlack(i - 1) && i - 1 >= from.value) used += whiteKey - blackKey / 2;
					else used += whiteKey;
				}
				if (used > space) break;
				i++;
			}
			if (i >= from.value + 12) to.value = i;
		}
	}
	useEffect(() => from.subscribe(resize), []);

	useEffect(() => {
		if (!container.current) return;
		const observer = new ResizeObserver(() => resize());
		observer.observe(container.current);
		return () => observer.disconnect();
	}, [container.current]);

	const hotkeys = Object.entries(keymap.value).reduce((acc, [k, v]) => {
		acc[v] = k;
		return acc;
	}, {} as { [k: string]: string });

	return (
		<div ref={container}>
			<div>
				<MidiNoteInput label="Start" value={from.value} setValue={v => from.value = v} />
			</div>
			<ol class={`${classes.piano} ${loading ? classes.loading : ''}`}>
				{Object.keys(notes.value).map(n =>
					<Key
						onPress={onPress}
						onRelease={onRelease}
						midi={+n}
						hotkey={hotkeys[n] || ''}
					/>
				)}
			</ol>
			{!loading ? null :
				<div class={classes.overlay}>
					Loading...
				</div>
			}
		</div>
	);
}
