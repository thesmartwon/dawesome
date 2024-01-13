import { signal } from '@preact/signals';
import classes from './main.css';

export const dark = signal(false);
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

dark.subscribe(d => document.body.className = d ? classes.dark : '');
if (window.matchMedia) {
	const match = window.matchMedia('(prefers-color-scheme: dark)');
	if (match) {
		dark.value = true;
		match.addEventListener('change', e => dark.value = Boolean(e.matches));
	}
}

const settings = {
	dark,
	pianoKeys,
};
export default settings;

export type Settings = typeof settings;
