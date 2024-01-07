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

function sortSamples(ctx: { [k: string]: number }, c1: string, c2: string): number {
	const v1 = ctx[c1] ?? Number.POSITIVE_INFINITY;
	const v2 = ctx[c2] ?? Number.POSITIVE_INFINITY;
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
				: drums.sampleNames.sort((a, b) => sortSamples(commonSamples, a, b)).map(sample =>
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

type Note = { note: string; beat: number; };
interface SampleSequencerProps {
	drums: DrumMachine;
	variation: string;
	beats: number[];
	queue: SortedQueue<Note>;
}

function SampleSequencer({ drums, variation, beats, queue }: SampleSequencerProps) {
	const note = variation;
	return (
		<>
			<button onMouseDown={() => drums.start({ note })}>
				{variation}
			</button>
			{beats.map(beat =>
				<button onMouseDown={ev => {
					drums.start({ note });
					const target = ev.currentTarget;
					if (target.classList.contains(classes.scheduled)) {
						queue.removeAll(i => i.note === variation && i.beat === beat);
					} else {
						queue.push({ note, beat });
					}
					target.classList.toggle(classes.scheduled);
				}}>
					{beat}
				</button>
			)}
		</>
	);
}

// high freq to low freq
const sequencing = {
	'crash': 1,
	'ride': 2,
	'clap': 3,
	'hat-open': 4,
	'hat-closed': 5,
	'tom-high': 6,
	'tom': 7,
	'tom-mid': 7,
	'tom-low': 8,
	'snare': 9,
	'kick': 10,
};

interface SampleSelectProps {
	drums: DrumMachine;
	value: string;
	onSelect: (v: string) => void;
}

function SampleSelect({ drums, value, onSelect }: SampleSelectProps) {
	const samples = drums.sampleNames;
	const [sample, setSample] = useState(value);
	const [variation, setVariation] = useState(value);
	const variations = getVariations(drums, sample);

	return (
		<>
			<select
				value={sample}
				onChange={ev => {
					const newSample = ev.currentTarget.value;
					setSample(newSample);
					if (getVariations(drums, newSample).length <= 1) {
						drums.start({ note: newSample });
						onSelect(newSample);
					}
				}}
			>
				{samples.map(s =>
					<option value={s}>{s}</option>
				)}
			</select>
			{variations.length > 1 &&
				<select value={variation} onChange={ev => {
					const newVariation = ev.currentTarget.value;
					drums.start({ note: newVariation });
					setVariation(newVariation);
					onSelect(newVariation);
				}}>
					{variations.map(v =>
						<option value={v}>{v.replace(sample + '-', '')}</option>
					)}
				</select>
			}
		</>
	)
}

export function PercussionSequencer({ drums }: { drums: DrumMachine }) {
	const [samples, setSamples] = useState<string[]>(
		Object.keys(sequencing)
			.filter(s => drums.sampleNames.includes(s))
			.sort((a, b) => sortSamples(sequencing, a, b))
	);
	const variations = samples.map(s => getVariations(drums, s)[0]);
	const [newVariation, setNewVariation] = useState(variations[0]);
	const beats = [0, 1, 2, 3, 4, 5, 6, 7];
	const queue = new SortedQueue<Note>((a, b) => a.beat - b.beat);
	const tempo = 85;
	const secondsPerBeat = 60.0 / tempo;

	function scheduleAll() {
		for (let i = 0; i < queue.size(); i++) {
			const note = queue.items[i];
			drums.player.start({
				note: note.note,
				time: getCtx().currentTime + note.beat * secondsPerBeat / 4,
			});
		}
	}

	return (
		<>
			<button onClick={scheduleAll}>
				play
			</button>
			<div class={classes.sequencePad}>
				{variations.map(v =>
					<SampleSequencer drums={drums} variation={v} beats={beats} queue={queue} />
				)}
			</div>
			<div>
				<SampleSelect drums={drums} value={newVariation} onSelect={v => setNewVariation(v)}/>
				<button onClick={() => setSamples([...samples, newVariation])}>
					Add
				</button>
			</div>
		</>
	);
}
