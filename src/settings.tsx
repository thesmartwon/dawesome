import { signal } from '@preact/signals';
import classes from './main.css';

export const dark = signal(false);
if (window.matchMedia) {
	const match = window.matchMedia('(prefers-color-scheme: dark)');
	if (match) {
		dark.value = true;
		match.addEventListener('change', e => dark.value = Boolean(e.matches));
	}
}
dark.subscribe(d => document.body.className = d ? classes.dark : '');

export const sampleUrl = signal(SAMPLE_URL);

// in order of semitones
// true if can be black
export const pianoKeys  = signal({
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
				sample url
				<input value={sampleUrl.value} onChange={ev => sampleUrl.value = ev.currentTarget.value} />
			</label>
			<br />
			<label>
				dark mode
				<input type="checkbox" checked={dark.value} onChange={() => {
					dark.value = !dark.value;
				}} />
			</label>
		</form>
	);
}
