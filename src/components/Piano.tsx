import { createSignal } from 'solid-js';
import { PitchedPlayer } from '../audio/PitchedPlayer';
import { PianoCanvas, NoteUpEvent, NoteDownEvent } from './index';
import styles from './Piano.module.css';

export interface PianoProps {
	player: PitchedPlayer;
	midi?: MIDIInput;
};
export function Piano(props: PianoProps) {
	const [pianoRef, setPianoRef] = createSignal<PianoCanvas | undefined>();

	return (
		<>
			<canvas
				is="daw-piano-played"
				class={styles.played}
				prop:piano={pianoRef()}
			>
				Canvas unsupported
			</canvas>
			<canvas
				is="daw-piano"
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
			>
				Canvas unsupported
			</canvas>
		</>
	);
}
