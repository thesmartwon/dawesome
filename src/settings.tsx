import { signal } from '@preact/signals';
import classes from './main.css';

const dark = signal(false);
if (window.matchMedia) {
	const match = window.matchMedia('(prefers-color-scheme: dark)');
	if (match) {
		dark.value = true;
		match.addEventListener('change', e => dark.value = Boolean(e.matches));
	}
}
dark.subscribe(d => document.body.className = d ? classes.dark : '');

// in order of semitones
// true if black
export const keys  = signal({
	'q': true,
	'a': false,
	'w': true,
	's': false,
	'e': true,
	'd': false,
	'r': true,
	'f': false,
	't': true,
	'g': false,
	'y': true,
	'h': false,
	'u': true,
	'j': false,
	'i': true,
	'k': false,
	'o': true,
	'l': false,
	'p': true,
	';': false,
	'[': true,
	"'": false,
	']': true,
});

export function Settings() {
	return (
		<form onSubmit={ev => ev.preventDefault()}>
			<label>
				dark mode
			</label>
			<input type="checkbox" checked={dark.value} onChange={() => {
				dark.value = !dark.value;
			}} />
		</form>
	);
}
