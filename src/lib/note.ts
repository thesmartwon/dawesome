import { Note, note as parseNote } from '@tonaljs/pitch-note';

export type { Note } from '@tonaljs/pitch-note';
export { note as parseNote } from '@tonaljs/pitch-note';
export function parseNoteNoFail(note: string): Note {
	const parsed = parseNote(note);
	if (parsed.empty) {
		throw new Error('parseNoteNoFail could not parse ' + note);
	}
	return parsed;
}

export type Midi = number;
export function isBlack(midi: Midi): boolean {
	return [1, 3, 6, 8, 10].includes(midi % 12);
}

