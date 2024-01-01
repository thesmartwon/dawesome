import { useEffect, useState } from 'preact/hooks';
import { DrumMachine } from 'smplr';
import { getCtx } from '../lib/ctx.js';
import classes from './percussion.css';

interface Percussion {
	name: string;
}

const samples = {
	'kick': 1,
	'snare': 2,
	'closed-hat': 3,
	'open-hat': 4,
	'tom': 5,
} as { [k: string]: number };

function sortSamples(c1: string, c2: string): number {
	const v1 = samples[c1] ?? Number.POSITIVE_INFINITY;
	const v2 = samples[c2] ?? Number.POSITIVE_INFINITY;
	if (v1 > v2) return 1;
	if (v1 < v2) return -1;
	return 0;
}

function getVariations(drums: DrumMachine, sample: string): string[] {
	const res = drums.getVariations(sample);
	if (res.length === 0) res.push(sample);
	return res;
}

export function Percussion({ name }: Percussion) {
  const [drums, setDrumMachine] = useState<DrumMachine | undefined>(undefined);

  useEffect(() => {
    new DrumMachine(getCtx(), { instrument: name }).load.then(setDrumMachine);
  }, [name]);

	useEffect(() => {
		return () => {
			if (drums) drums.sampleNames.forEach(sample =>
				getVariations(drums, sample).forEach(variation => drums.stop({ stopId: variation }))
			);
		};
	}, [drums]);

	return (
		<ul class={classes.samples}>
			{!drums
				? 'loading'
				: drums.sampleNames.sort(sortSamples).map(sample =>
					<li class={classes.sample}>
						<h3>
							{sample}
						</h3>
						<ul>
							{getVariations(drums, sample).map((variation, i) =>
								<button
									class={classes.button}
									onMouseDown={() => drums.start({ note: variation })}
								>
									{i}
								</button>
							)}
						</ul>
					</li>
				)
			}
		</ul>
	);
}

