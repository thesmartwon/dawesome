import { useEffect, useState } from 'preact/hooks';
import { DrumMachine } from '../../smplr';
import { getCtx, getStorage } from '../../lib/ctx.js';
import { sampleUrl } from '../../settings.js';
import classes from './sound.css';

interface PercussionProps {
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

export function sortSamples(ctx: { [k: string]: number }, c1: string, c2: string): number {
	const v1 = ctx[c1] ?? Number.POSITIVE_INFINITY;
	const v2 = ctx[c2] ?? Number.POSITIVE_INFINITY;
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
				: drums.samples().sort((a, b) => sortSamples(commonSamples, a, b)).map(sample =>
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

