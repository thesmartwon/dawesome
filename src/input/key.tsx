import { Midi, isBlack } from '../lib/note.js';
import { midiToNoteName } from '@tonaljs/midi';
import classes from './key.css';

export type PianoNote = {
  midi: Midi;
  velocity: number;
  time?: number;
  duration?: number;
};

interface KeyProps {
	onPress: (note: PianoNote) => void;
	onRelease?: (midi: Midi) => void;
	midi: Midi;
	hotkey: string;
};

export function Key({ midi, onPress, onRelease, hotkey }: KeyProps) {
	function release() {
		onRelease && onRelease(midi);
	};
	function press(ev: MouseEvent) {
		const target = ev.target as HTMLButtonElement;
		const rect = target.getBoundingClientRect();
		const percDown = (ev.clientY - rect.top) / rect.height;
		const velocity = (percDown + .1) * 100;
		onPress({ midi, velocity });
	}
	const name = midiToNoteName(midi);

	return (
		<li
			class={
				[
					classes.key,
					isBlack(midi) ? classes.black : classes.white,
				].join(' ')
			}
			data-key={midi}
			data-key-name={name[0]}
		>
			<button
				onMouseDown={press}
				onMouseUp={release}
				onMouseLeave={release}
				onMouseEnter={ev => {
					if (ev.buttons == 0) return;
					press(ev);
				}}
				/* playable via hotkeys */
				tabindex={-1}
			>
				<div class={classes.hotkey}>{hotkey || <br />}</div>
				{name}
			</button>
		</li>
	);
}
