import { useRef } from 'preact/hooks';
import { Instrument } from 'tone/Tone/instrument/Instrument.js';
import { Note } from '../note.js';
import classes from './key.css';

interface KeyProps {
	n: Note;
	instrument: Instrument<any>;
};

export function Key({ n, instrument }: KeyProps) {
	const li = useRef<HTMLLIElement | null>(null);

	function triggerAttack() {
		instrument.triggerAttack(n);
		li.current?.classList.toggle(classes.active);
		setTimeout(() => li.current?.classList.toggle(classes.active), 100);
	}

	return (
		<li
			class={
				[
					classes.key,
					['#', 'b'].includes(n[1]) ? classes.black : classes.white,
				].join(' ')
			}
			ref={li}
		>
			<button
				onMouseDown={triggerAttack}
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
