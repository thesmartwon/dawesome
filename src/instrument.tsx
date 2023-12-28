import { Sampler } from 'tone';
import { Piano } from './input/piano.js';
import { Percussion } from './input/percussion.js';
import { Instrument as ToneInstrument } from 'tone/Tone/instrument/Instrument.js';

// Copy from indexer.js
export type Category =
	| 'percussion'
	| 'strings'
	| 'woodwinds'
	| 'brass'
	| 'keyboards';

export interface InstrumentData {
	sampled: boolean;
	files: string[];
}

interface InstrumentProps {
	category: Category;
	name: string;
	instrument: InstrumentData;
	autofocus: boolean;
}

const players = {
	'keyboards': {
		component: Piano,
		toneInstrument({ category, name, instrument }: InstrumentProps): ToneInstrument<any> {
			const baseUrl = `${category}/${name}/`;
			const urls = instrument.files.reduce((acc, cur) => {
				acc[cur] = cur;
				return acc;
			}, {} as { [k: string]: string });
			return new Sampler({ urls, baseUrl, attack: 0, });
		}
	},
	'percussion': {
		component: Percussion,
		toneInstrument({ category, name, instrument }: InstrumentProps): ToneInstrument<any> {
			const baseUrl = `${category}/${name}/`;
			// https://www.midi.org/specifications-old/item/gm-level-1-sound-set
			const urls = instrument.files.reduce((acc, cur, i) => {
				acc[i + 1] = cur;
				return acc;
			}, {} as { [k: number]: string });
			return new Sampler({ urls, baseUrl });
		}
	},
};

export function Instrument(props: InstrumentProps) {
	const player = players[props.category];
	const toneInstrument = player?.toneInstrument(props).toDestination() as any;
	const Component = player?.component;
	// useEffect(() => instrument.releaseAll, []);

	return (
		<div>
			<h1>{props.name} ({props.instrument.files.length} samples)</h1>
			{Component
				? <Component
						name={props.name}
						category={props.category}
						instrument={toneInstrument}
						instrumentData={props.instrument}
						autofocus={props.autofocus}
					/>
				: `no player for category ${props.category}`}
		</div>
	);
}
