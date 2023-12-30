import { signal } from '@preact/signals';

const dark = signal(false);
if (window.matchMedia) {
	const match = window.matchMedia('(prefers-color-scheme: dark)');
	if (match) {
		dark.value = true;
		match.addEventListener('change', e => dark.value = Boolean(e.matches));
	}
}
dark.subscribe(d => document.body.className = d ? 'dark' : '');

export function Settings() {
	return (
		<button onClick={() => dark.value = !dark.value}>
			toggle dark mode
		</button>
	);
}
