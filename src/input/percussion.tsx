import type { InstrumentData } from '../instrument.js';
import { Instrument } from 'tone/Tone/instrument/Instrument.js';
import { useState } from 'preact/hooks';
import { Midi } from 'tone';
import { Note } from '../note.js';
import classes from './percussion.css';

interface Percussion {
	instrument: Instrument<any>;
	instrumentData: InstrumentData;
}

interface Sound {
	name: string,
	index: number,
}

interface SoundButton {
 sound: Sound;
 instrument: Instrument<any>;
}

const categories = {
	'kick': 1,
	'snare': 2,
	'closed-hat': 3,
	'open-hat': 4,
	'tom': 5,
} as { [k: string]: number };

function sortCategories(c1: string, c2: string): number {
	const v1 = categories[c1] ?? Number.POSITIVE_INFINITY;
	const v2 = categories[c2] ?? Number.POSITIVE_INFINITY;
	if (v1 > v2) return 1;
	if (v1 < v2) return -1;
	return 0;
}

function SoundButton({ instrument, sound } : SoundButton) {
	const [held, setHeld] = useState(false);

	function triggerAttack() {
		const note: Note = Midi(sound.index).toNote();
		instrument.triggerAttack(note);
		setHeld(true);
	}

	function triggerRelease() {
		const note: Note = Midi(sound.index).toNote();
		instrument.triggerRelease(note);
		setHeld(false);
	}

	return (
		<button
			onMouseDown={triggerAttack}
			onMouseUp={triggerRelease}
			onMouseLeave={triggerRelease}
			onMouseEnter={ev => {
				if (ev.buttons == 0) return;
				triggerAttack();
			}}
			class={held ? classes.active : ''}
		>
			{sound.name}
		</button>
	);
}

export function Percussion({ instrument, instrumentData }: Percussion) {
	const sounds = instrumentData.files.reduce((acc, cur, i) => {
		const firstDigit = cur.match(/\d/);
		const suffixStart = firstDigit ? firstDigit.index : cur.indexOf('.');
		const noSuffix = cur.substring(0, suffixStart);
		acc[noSuffix] = acc[noSuffix] || [];
		acc[noSuffix].push({
			name: cur.substring(0, cur.indexOf('.')),
			index: i + 1,
		});
		return acc;
	}, {} as { [k: string]: Sound[] });
	return (
		<ul>
			{Object.keys(sounds).sort(sortCategories).map(k => (
				<li class={classes.category}>
					{sounds[k].map(s => (
						<SoundButton instrument={instrument} sound={s} />
					))}
				</li>
			))}
		</ul>
	);
}

