import { useSignal } from '@preact/signals';
import { useRef, useEffect, useState, useMemo } from 'preact/hooks';
import { MIDISelect, Input } from './input/midi.js';
import { Piano } from './input/piano.js';
import { Percussion } from './input/percussion.js';
import { getCtx, getStorage } from './lib/ctx.js';
import { SplendidGrandPiano } from './smplr/index.js';
import { Midi } from './lib/note.js';
import { PianoNote } from './input/key.js';
import keyClasses from './input/key.css';
import { midiToNoteName } from '@tonaljs/midi';
import { Category } from './types.js';

interface InstrumentProps {
	category: Category;
	name: string;
	files: string[];
}

interface PianoPlayerProps {
	baseUrl: string;
};

function PianoPlayer({ baseUrl }: PianoPlayerProps) {
	const div = useRef<HTMLDivElement | null>(null);
	const [lastPlayed, setLastPlayed] = useState<{ note: number, velocity: number }  | null>(null);
	const loading = useSignal(true);
	const [input, setInput] = useState<Input>();

	const instrument = useMemo(
		() => {
			const res = new SplendidGrandPiano(getCtx(), baseUrl, { storage: getStorage() });
			res.load.then(() => loading.value = false);
			return res;
		},
		[baseUrl]
	);

	function onPress(ev: PianoNote) {
		const key = div.current?.querySelector(`li[data-key="${ev.midi}"]`) as HTMLLIElement;
		if (loading.value || (key && key.classList.contains(keyClasses.held))) return;
		const sample = {
			note: ev.midi,
			velocity: ev.velocity,
			onStart() {
				if (!key) return;
				key.style.setProperty('--mix-perc', Math.min(ev.velocity, 100) + '%');
				key.classList.add(keyClasses.held);
			},
			time: ev.time,
	 };

		instrument.start(sample);
		setLastPlayed(sample);
	}

	function onRelease(midi: Midi) {
		instrument.stop({ stopId: midi });
		const key = div.current?.querySelector(`li[data-key="${midi}"]`);
		if (key) key.classList.remove(keyClasses.held);
	}

	useEffect(() => {
		function playMidiNote(event: Event) {
			const ev = event as MIDIMessageEvent;
			const [pressed, midiNote, velocity] = ev.data;
			const note: PianoNote = { midi: midiNote, velocity };
			if (pressed == 144) onPress(note);
			if (pressed == 128) onRelease(note.midi);
		}
		input?.addEventListener('midimessage', playMidiNote);
		return () => input?.removeEventListener('midimessage', playMidiNote);
	}, [input]);

	useEffect(() => () => instrument.stop(), []);

	return (
		<div ref={div}>
			<MIDISelect value={input} setValue={setInput} />
			<Piano onPress={onPress} onRelease={onRelease} loading={loading.value} />
			<div>
				{lastPlayed && `Note: ${midiToNoteName(+lastPlayed.note)} Velocity: ${Math.round(+lastPlayed.velocity)}`}
			</div>
		</div>
	);
}

export function InstrumentPlayer({ category, name, files }: InstrumentProps) {
	if (files.length === 0) return null;

	if (category === 'percussion') return <Percussion name={name} files={files} />

	return <PianoPlayer baseUrl={`${SAMPLE_URL}/${category}/${name}`} />
}
