import { Sampler } from 'tone';
import { Piano } from './input/piano.js';

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
	if (category === 'keyboards') {
		const urls = instrument.files.reduce((acc, cur) => {
			acc[cur] = cur;
			return acc;
		}, {} as { [k: string]: string });
		const baseUrl = `${category}/${name}/`;
		const sampler = new Sampler({ urls, baseUrl, attack: 0, }).toDestination();
		return <Piano instrument={sampler as any} />;
	}

	return <p>unsupported category {category}</p>;
}

export function InstrumentPlayer({ name, category, instrument }: InstrumentProps) {
	return (
		<div>
			<h1>{name} ({instrument.files.length} samples)</h1>
			<Player name={name} category={category} instrument={instrument} />
		</div>
	);
}
