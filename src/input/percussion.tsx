import { useEffect, useState } from 'preact/hooks';
import { DrumMachine } from '../smplr';
import { getCtx, getStorage } from '../lib/ctx.js';
import classes from './percussion.css';
import { SortedQueue } from '../smplr/player/sorted-queue.js';

interface Percussion {
	name: string;
	files: string[];
}

const commonSamples = {
	'kick': 1,
	'snare': 2,
	'closed-hat': 3,
	'open-hat': 4,
	'tom': 5,
	'tom-high': 6,
	'tom-mid': 7,
	'tom-low': 8,
	'conga-high': 9,
	'conga-mid': 10,
	'conga-low': 11,
} as { [k: string]: number };

function sortSamples(c1: string, c2: string): number {
	const v1 = commonSamples[c1] ?? Number.POSITIVE_INFINITY;
	const v2 = commonSamples[c2] ?? Number.POSITIVE_INFINITY;
	if (v1 > v2) return 1;
	if (v1 < v2) return -1;
	return 0;
}

function getVariations(drums: DrumMachine, sample: string): string[] {
	const res = drums.getVariations(sample);
	if (res.length === 0) res.push(sample);
	return res;
}

export function Percussion({ name, files }: Percussion) {
  const [drums, setDrumMachine] = useState<DrumMachine | undefined>(undefined);

  useEffect(() => {
		const url = `${SAMPLE_URL}/percussion/${name}`;
    new DrumMachine(getCtx(), { url, files, storage: getStorage() }).load.then(setDrumMachine);
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

export function PercussionSequencer({ drums }: { drums: DrumMachine }) {
	const samples = Object.keys(commonSamples).sort(sortSamples);
	const beats = [0, 1, 2, 3, 4, 5, 6, 7];
  type Note = { note: string; beat: number; };
	const queue = new SortedQueue<Note>((a, b) => a.beat - b.beat);
	const tempo = 85;
	const secondsPerBeat = 60.0 / tempo;

	return (
		<>
			<button onClick={() => {
				for (let i = 0; i < queue.size(); i++) {
					const note = queue.items[i];
					drums.player.start({
						note: note.note,
						time: getCtx().currentTime + note.beat * secondsPerBeat / 4,
					});
				}
			}}>play</button>
			<div class={classes.sequencePad}>
				{samples.map(sample =>
					<>
						<button onMouseDown={() => drums.start({ note: sample })}>
							{sample}
						</button>
						{beats.map(beat =>
							<button onMouseDown={ev => {
								drums.start({ note: sample });
								const target = ev.currentTarget;
								if (target.classList.contains(classes.scheduled)) {
									queue.removeAll(i => i.note === sample && i.beat === beat);
								} else {
									queue.push({ note: sample, beat: beat });
								}
								target.classList.toggle(classes.scheduled);
							}}>
								{beat}
							</button>
						)}
					</>
				)}
			</div>
		</>
	);
}
