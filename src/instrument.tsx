import { useRef, useEffect, useState, useMemo } from 'preact/hooks';
import { MIDISelect, Input } from './input/midi.js';
import { Piano } from './input/piano.js';
import { Soundboard } from './input/soundboard.js';
import { getCtx, getStorage } from './lib/ctx.js';
import { SplendidGrandPiano } from './smplr/index.js';
import { Midi } from './lib/note.js';
import { PianoNote } from './input/key.js';
import keyClasses from './input/key.css';
import { midiToNoteName } from '@tonaljs/midi';
import { Instrument } from './lib/db.js';
import { Sampler, Samples } from './smplr';

interface PercussionPlayerProps {
	name: string;
	baseUrl: string;
	files: string[];
};
function PercussionPlayer({ name, baseUrl, files }: PercussionPlayerProps) {
	const sampler = useMemo(() => {
		const samples = files.reduce((acc, cur) => {
			acc[cur] = {
				name: cur,
				url: `${baseUrl}/${cur}.ogg`,
				state: 'loading',
			};
			return acc;
		}, {} as Samples);
		return new Sampler({ samples });
	}, [baseUrl, files]);

	return <Soundboard name={name} sampler={sampler} />;
}

interface PianoPlayerProps {
	baseUrl: string;
};
function PianoPlayer({ baseUrl }: PianoPlayerProps) {
	const div = useRef<HTMLDivElement | null>(null);
	const [lastPlayed, setLastPlayed] = useState<{ note: number, velocity: number }  | null>(null);
	const [input, setInput] = useState<Input>();
	const [piano, setPiano] = useState<SplendidGrandPiano | undefined>(undefined);

	useEffect(() => {
		new SplendidGrandPiano(getCtx(), baseUrl, { storage: getStorage() }).load.then(setPiano);
	}, [baseUrl]);
	useEffect(() => () => piano?.stop(), []);

	function onPress(ev: PianoNote) {
		const key = div.current?.querySelector(`li[data-key="${ev.midi}"]`) as HTMLLIElement;
		if (!piano || (key && key.classList.contains(keyClasses.held))) return;
		const sample = {
			note: ev.midi,
			velocity: ev.velocity,
			onStart() {
				if (!key) return;
				key.style.setProperty('--mix-perc', Math.min(ev.velocity, 100) + '%');
				key.classList.add(keyClasses.held);
			},
		};

		piano.start(sample);
		setLastPlayed(sample);
	}

	function onRelease(midi: Midi) {
		piano?.stop({ stopId: midi });
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


	return (
		<div ref={div}>
			<MIDISelect value={input} setValue={setInput} />
			<Piano onPress={onPress} onRelease={onRelease} loading={!piano} />
			<div>
				{lastPlayed && `Note: ${midiToNoteName(+lastPlayed.note)} Velocity: ${Math.round(+lastPlayed.velocity)}`}
			</div>
		</div>
	);
}

interface InstrumentProps {
	instrument?: Instrument;
	files: string[];
};
export function InstrumentPlayer({ instrument, files }: InstrumentProps) {
	if (files.length === 0 || !instrument) return null;
	const baseUrl = `${SAMPLE_URL}/${instrument.category}/${instrument.name}`;
	switch (instrument.category) {
		case undefined: return null;
		case 'percussion': return <PercussionPlayer baseUrl={baseUrl} files={files} name={instrument.name} />;
		default: return <PianoPlayer baseUrl={baseUrl} />;
	}
}
