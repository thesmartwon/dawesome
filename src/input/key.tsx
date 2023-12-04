import { useState } from 'preact/hooks';
import { Instrument } from 'tone/Tone/instrument/Instrument.js';
import { Note } from '../note.js';
import classes from './key.css';

interface KeyProps {
	n: Note;
	instrument: Instrument<any>;
	held: boolean;
};

export function Key({ n, instrument, held }: KeyProps) {
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
					['#', 'b'].includes(n[1]) ? classes.black : classes.white,
					(held || isHeld) ? classes.active : '',
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
			>
				{n}
			</button>
		</li>
	);
}
