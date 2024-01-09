import { useEffect, useState } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { Sampler } from '../../smplr';
import { QueuedPlayer } from '../../smplr/player/queued-player.js';
import { classnames, range } from '../../helpers.js';
import { Play, Stop, Refresh } from '../../icons/index.js';
import { Sequence } from '../../sequence.js';
import { sortSamples } from './sound.js';
import classes from './sequence.css';

interface BeatProps {
	drums: Sampler;
	variation: string;
	beat: number;
	sequence: Sequence;
	timeSigDenom: number;
	onChange: () => void;
}

function Beat({ drums, variation, beat, sequence, timeSigDenom, onChange }: BeatProps) {
	const note = variation;
	const [scheduled, setScheduled] = useState(sequence.contains({ note, beat }));

	return (
		<button
			onMouseDown={() => {
				if (scheduled) {
					sequence.removeAll(i => i.note === variation && i.beat === beat);
					setScheduled(false);
				} else {
					drums.start({ note });
					sequence.push({ note, beat });
					setScheduled(true);
				}
				onChange();
			}}
			class={classnames(
				beat % timeSigDenom === 0 && classes.barStart,
				scheduled && classes.scheduled
			)}
		>
		</button>
	);
}

export interface PercussionProps {
	drums: Sampler;
	sequence: Sequence;
	onChange: () => void;
}

export function Percussion({ drums, sequence, onChange }: PercussionProps) {
	const samples = Object.keys(drums.samples).sort(sortSamples);
	const beats = range(0, 31);
	const [playing, setPlaying] = useState(false);
	const tempo = useSignal(60);
	const ctx = drums.player.context;
	const start = useSignal(ctx.currentTime);
	const player = drums.player.player as QueuedPlayer;
	const timeSigDenom = useSignal(4);
	const loop = useSignal(true);

	function beatTime(beat: number) {
		return start.value + beat * 60 / tempo.value / timeSigDenom.value;
	}

	function scheduleAll() {
		let lastBeat = -1;
		for (let i = 0; i < sequence.size(); i++) {
			const note = sequence.items[i];
			if (note.beat != lastBeat) lastBeat = note.beat;
			drums.player.start({ note: note.note, time: beatTime(note.beat) });
		}
		drums.player.start({
			note: 'silence',
			time: beatTime(beats.length),
			duration: 0,
			onEnded: () => {
				setPlaying(false);
				if (loop.value) onPlay();
			}
		});
	}

	function onPlay() {
		start.value = ctx.currentTime;
		scheduleAll();
		setPlaying(true);
	}

	function onStop() {
		drums.stop();
		setPlaying(false);
	}

	useEffect(() => onStop, []);

	return (
		<>
			<button onClick={() => playing ? onStop() : onPlay()}>
				{playing ? <Stop / > : <Play />}
			</button>
			<button onClick={() => loop.value = !loop.value} class={classnames(loop.value && classes.loop)}>
				<Refresh />
			</button>
			<label>
				BPM
				<input
					type="range"
					min={30}
					max={300}
					value={tempo.value}
					onInput={ev => {
						const newTempo = +ev.currentTarget.value;
						player.queue.items.forEach(i => {
							i.time = start.value + (i.time - start.value) * tempo.value / newTempo / timeSigDenom.value;
						});
						tempo.value = newTempo;
					}}
				/>
			 {tempo.value}
			</label>
			<div class={classes.sequencePad}>
				<div class={classes.seqenceHeadings}>
					{samples.map(v =>
						<button onMouseDown={() => drums.start({ note: v })}>
							{v}
						</button>
					)}
				</div>
				<div class={classes.beats} style={{ '--n-columns': beats.length }}>
					{samples.map(v =>
						beats.map(beat =>
							<Beat
								drums={drums}
								variation={v}
								beat={beat}
								sequence={sequence}
								timeSigDenom={timeSigDenom.value}
								onChange={onChange}
							/>
						)
					)}
				</div>
			</div>
		</>
	);
}
