import { createSignal } from 'solid-js';
import { PitchedPlayer } from '../audio/PitchedPlayer';
import { Piano as PianoCanvas, NoteUpEvent, NoteDownEvent } from '../webcomponents/Piano';
import '../webcomponents/Piano'; // daw-piano
import '../webcomponents/PianoPlayed'; // daw-piano
import styles from './Piano.module.css';

export interface PianoProps {
	player: PitchedPlayer;
	midi?: MIDIInput;
};
export function Piano(props: PianoProps) {
	const [pianoRef, setPianoRef] = createSignal<PianoCanvas | undefined>();

	return (
		<>
			<daw-piano-played
				class={styles.played}
				prop:hello={"asdf"}
				prop:piano={pianoRef()}
			/>
			<daw-piano
				ref={setPianoRef}
				class={styles.piano}
				onNoteDown={(ev: NoteDownEvent) => {
					const { note, velocity } = ev.detail;
					props.player.playNote(note, velocity);
				}}
				onNoteUp={(ev: NoteUpEvent) => {
					const { note } = ev.detail;
					props.player.stopNote(note);
				}}
				prop:midi={props.midi}
			/>
		</>
	);
}
