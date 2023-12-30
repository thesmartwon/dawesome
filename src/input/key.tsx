import { useState } from 'preact/hooks';
import { Instrument } from 'tone/Tone/instrument/Instrument.js';
import { Note, isBlack as isSharp } from '../note.js';
import classes from './key.css';

interface KeyProps {
	n: Note;
	instrument: Instrument<any>;
	held: boolean;
	hotkey: string;
};

export function Key({ n, instrument, held, hotkey }: KeyProps) {
	const [isHeld, setIsHeld] = useState(held);

	function triggerAttack() {
		instrument.triggerAttack(n);
		setIsHeld(true);
	}

	function triggerRelease() {
		instrument.triggerRelease(n);
		setIsHeld(false);
	}

	return (
		<li
			class={
				[
					classes.key,
					isSharp(n) ? classes.black : classes.white,
					['C', 'F'].includes(n[0]) ? '' : classes.marginLeft,
					(held || isHeld) ? classes.held : '',
				].join(' ')
			}
		>
			<button
				onMouseDown={triggerAttack}
				onMouseUp={triggerRelease}
				onMouseLeave={triggerRelease}
				onMouseEnter={ev => {
					if (ev.buttons == 0) return;
					triggerAttack();
				}}
				/* playable via hotkeys */
				tabindex={-1}
			>
				{hotkey && <div>{hotkey}</div>}
				{n}
			</button>
		</li>
	);
}
