import { useRef, useEffect, useState } from 'preact/hooks';
import { MIDISelect, Input } from './input/midi.js';
import { Piano } from './input/piano.js';
import { Percussion } from './input/percussion.js';
import { getCtx } from './lib/ctx.js';
import { SplendidGrandPiano, CacheStorage } from './smplr/index.js';
import { Midi } from './lib/note.js';
import { PianoNote } from './input/key.js';
import keyClasses from './input/key.css';

// Copy from indexer.js
export type Category =
	| 'percussion'
	| 'strings'
	| 'wind'
	| 'electronic';

interface InstrumentProps {
	category: Category;
	name: string;
	files: string[];
	autofocus: boolean;
}

interface PianoPlayerProps {
	autofocus: boolean;
};

const storage = new CacheStorage();

function PianoPlayer({ autofocus }: PianoPlayerProps) {
	const [loading, setLoading] = useState(true);
	const [input, setInput] = useState<Input>();
	const div = useRef<HTMLDivElement | null>(null);

	const playing = {} as { [midi: Midi]: boolean };
	const instrument = new SplendidGrandPiano(getCtx(), { storage });

	instrument.load.then(() => setLoading(false));

	function onPress(ev: PianoNote) {
		if (loading || playing[ev.midi]) return;
		playing[ev.midi] = true;
		instrument.start({
			note: ev.midi,
			velocity: ev.velocity,
			onStart() {
				const key = div.current?.querySelector(`li[data-key="${ev.midi}"]`);
				if (key) key.classList.add(keyClasses.held);
			},
			time: ev.time,
	 });
	}

	function onRelease(midi: Midi) {
		playing[midi] = false;
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
			<Piano autofocus={autofocus} onPress={onPress} onRelease={onRelease} loading={loading} />
		</div>
	);
}

function InstrumentPlayer({ category, name, files, autofocus }: InstrumentProps) {
	if (category === 'percussion') return <Percussion name={name} files={files} />

	return <PianoPlayer autofocus={autofocus} />
}

export function Instrument(props: InstrumentProps) {
	return (
		<>
			<h1>{props.name}</h1>
			<InstrumentPlayer {...props} />
		</>
	);
}
