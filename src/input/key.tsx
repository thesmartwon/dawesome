import { Midi, isBlack } from '../lib/note.js';
import classes from './key.css';
import { midiToNoteName } from '@tonaljs/midi';

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
		const percDown = (ev.clientY - rect.top) / rect.height + .1;
		const velocity = Math.max(percDown, 1) * 100;
		onPress({ midi, velocity });
	}
	const name = midiToNoteName(midi);

	return (
		<li
			class={
				[
					classes.key,
					isBlack(midi) ? classes.black : classes.white,
					['C', 'F'].includes(name[0]) ? '' : classes.marginLeft,
				].join(' ')
			}
			data-key={midi}
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
				{hotkey && <div>{hotkey}</div>}
				{name}
			</button>
		</li>
	);
}
