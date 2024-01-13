import { useState, useEffect } from 'preact/hooks';
import { Sampler, Sample } from '../smplr';
import classes from './soundboard.css';

// https://en.wikipedia.org/wiki/Drum_kit
// https://en.wikipedia.org/wiki/Percussion_notation
export const standardKit = {
	'crash': 1,
	'ride': 2,
	'hat-closed': 3,
	'hat-open': 4,
	'tom-high': 5,
	'tom-mid': 6,
	'rim': 7,
	'snare': 8,
	'tom-low': 9,
	'kick': 10,
} as { [k: string]: number };

export const nonStandardKit = {
	// Over 20 is non-standard
	'conga-high': 20,
	'conga': 21,
	'conga-mid': 21,
	'conga-low': 22,

	'rim-high': 23,
	'rim': 24,
	'rim-mid': 24,
	'rim-low': 25,
} as { [k: string]: number };

export function sortSamples(c1: string, c2: string): number {
	const v1 = standardKit[c1] ?? nonStandardKit[c1] ?? Number.POSITIVE_INFINITY;
	const v2 = standardKit[c2] ?? nonStandardKit[c2] ?? Number.POSITIVE_INFINITY;
	if (v1 > v2) return 1;
	if (v1 < v2) return -1;
	return 0;
}

interface SampleButtonProps {
	name: string;
	category: string;
	sampler: Sampler;
	note: string;
};
function SampleButton({ name, category, sampler, note }: SampleButtonProps) {
	const sample = sampler.samples[note];
	const [state, setState] = useState(sample.state);
	useEffect(() => {
		setState(sample.state);
		sample.onStateChange = setState;
	}, [sample]);

	return (
		<button
			class={classes.button}
			disabled={state !== 'success'}
			onMouseDown={() => sampler.start({ note })}
			draggable
			onDragStart={ev => {
				if (!ev.dataTransfer) return;
				ev.dataTransfer.dropEffect = "copy";
				ev.dataTransfer.setData('text/uri-list', sample.url);
				ev.dataTransfer.setData('text/plain', sample.url);
				ev.dataTransfer.setData('name', `${sample.url} (${name})`);
				// Saves serializing or fetching + converting
				window.dragBuffer = sampler.player.buffers[sample.name];
			}}
			onDragEnd={() => window.dragBuffer = undefined}
		>
			{note.replace(category, '').replace(/^-/, '')}
		</button>
	);
}

interface SoundboardProps {
	name: string;
	sampler: Sampler;
}
export function Soundboard({ name, sampler }: SoundboardProps) {
	useEffect(() => sampler.stop(), []);

	const variations = Object.values(sampler.samples)
		.map(s => s.name)
		.reduce((acc, cur) => {
			const split = cur.split('-');
			const name = split[0];
			let adjective = split[1] ?? '';
			let variation = split[2] ?? '';
			if (split.length == 2 && /^\d+$/.test(split[1])) {
				adjective = '';
				variation = split[1];
			}
			const key = `${name}${adjective ? '-' + adjective : ''}`;
			acc[key] = acc[key] || [];
			acc[key].push(`${key}${variation ? '-' + variation : ''}`);
			return acc;
		}, {} as { [k: string]: string[] })

	function sampleVariations(name: string): string[] {
		const res = variations[name] ?? [];
		if (res.length === 0 && name in variations) res.push(name);
		return res;
	}

	return (
		<ul class={classes.samples}>
			{Object.keys(variations).sort(sortSamples).map(category =>
				<li class={classes.sample}>
					<h3>
						{category}
					</h3>
					<ul>
						{sampleVariations(category).map(note =>
							<SampleButton name={name} category={category} sampler={sampler} note={note} />
						)}
					</ul>
				</li>
			)}
		</ul>
	);
}

