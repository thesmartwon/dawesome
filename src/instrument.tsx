import { Sampler } from 'tone';
import { Piano } from './input/piano.js';
import { Percussion } from './input/percussion.js';

// Copy from indexer.js
export type Category =
	| 'percussion'
	| 'strings'
	| 'woodwinds'
	| 'brass'
	| 'keyboards';

export interface Instrument {
	pitched: boolean;
	files: string[];
}

interface InstrumentProps {
	category: Category;
	name: string;
	instrument: Instrument;
}

function Player({ category, name, instrument }: InstrumentProps) {
	const baseUrl = `${category}/${name}/`;
	if (category === 'keyboards') {
		const urls = instrument.files.reduce((acc, cur) => {
			acc[cur] = cur;
			return acc;
		}, {} as { [k: string]: string });
		const sampler = new Sampler({ urls, baseUrl, attack: 0, }).toDestination();
		return <Piano instrument={sampler as any} />;
	} else if (category === 'percussion') {
		// https://www.midi.org/specifications-old/item/gm-level-1-sound-set
		const urls = instrument.files.reduce((acc, cur, i) => {
			acc[i + 1] = cur;
			console.log(i + 1, cur)
			return acc;
		}, {} as { [k: number]: string });
		const sampler = new Sampler({ urls, baseUrl }).toDestination();
		return <Percussion instrument={sampler as any} files={instrument.files} />
	}

	// useEffect(() => instrument.releaseAll, []);

	return <p>no {category} player yet</p>;
}

export function InstrumentPlayer({ name, category, instrument }: InstrumentProps) {
	return (
		<div>
			<h1>{name} ({instrument.files.length} samples)</h1>
			<Player name={name} category={category} instrument={instrument} />
		</div>
	);
}
