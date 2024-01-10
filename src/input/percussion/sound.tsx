import { useEffect, useState } from 'preact/hooks';
import { DrumMachine } from '../../smplr';
import { getCtx, getStorage } from '../../lib/ctx.js';
import { sampleUrl } from '../../settings.js';
import classes from './sound.css';

interface PercussionProps {
	name: string;
	files: string[];
}

// https://en.wikipedia.org/wiki/Drum_kit
// https://en.wikipedia.org/wiki/Percussion_notation
export const standardKit = {
	'kick': 1,
	'tom-low': 2,
	'snare': 3,
	'rim': 4,
	'tom-mid': 5,
	'tom-high': 6,
	'hat-open': 7,
	'hat-closed': 8,
	'ride': 9,
	'crash': 10,
} as { [k: string]: number };

export const nonStandardKit = {
	// Over 20 is non-standard
	'conga-low': 20,
	'conga-mid': 21,
	'conga': 21,
	'conga-high': 22,

	'rim-low': 23,
	'rim-mid': 24,
	'rim': 24,
	'rim-high': 25,
} as { [k: string]: number };

export function sortSamples(c1: string, c2: string): number {
	const v1 = standardKit[c1] ?? nonStandardKit[c1] ?? Number.POSITIVE_INFINITY;
	const v2 = standardKit[c2] ?? nonStandardKit[c2] ?? Number.POSITIVE_INFINITY;
	if (v1 > v2) return 1;
	if (v1 < v2) return -1;
	return 0;
}

export function Percussion({ name, files }: PercussionProps) {
  const [drums, setDrumMachine] = useState<DrumMachine | undefined>(undefined);
	const url = `${sampleUrl}/percussion/${name}`;

  useEffect(() => {
    new DrumMachine(getCtx(), { url, files, storage: getStorage() }).load.then(setDrumMachine);
  }, [name]);

	useEffect(() => {
		return () => {
			if (drums) drums.samples().forEach(sample =>
				drums.sampleVariations(sample).forEach(variation => drums.stop({ stopId: variation }))
			);
		};
	}, [drums]);

	return (
		<ul class={classes.samples}>
			{!drums
				? 'loading'
				: drums.samples().sort(sortSamples).map(sample =>
					<li class={classes.sample}>
						<h3>
							{sample}
						</h3>
						<ul>
							{drums.sampleVariations(sample).map(note =>
								<button
									class={classes.button}
									onMouseDown={() => drums.start({ note })}
									draggable
									onDragStart={ev => {
										if (!ev.dataTransfer) return;
										ev.dataTransfer.dropEffect = "copy";
										const uri = `${url}/${note}.ogg`;
										ev.dataTransfer.setData('text/uri-list', uri);
										ev.dataTransfer.setData('text/plain', uri);
										ev.dataTransfer.setData('name', `${note} (${name})`);
										// Saves serializing or fetching + converting
										window.dragBuffer = drums.player.buffers[note];
									}}
									onDragEnd={() => window.dragBuffer = undefined}
								>
									{note.replace(sample, '').replace(/^-/, '')}
								</button>
							)}
						</ul>
					</li>
				)
			}
		</ul>
	);
}

