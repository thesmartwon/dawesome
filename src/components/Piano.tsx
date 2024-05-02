import { createSignal } from 'solid-js';
import { PitchedPlayer } from '../audio/PitchedPlayer';
import { Piano as PianoCanvas, NoteUpEvent, NoteDownEvent } from '../webcomponents/Piano';
import { ContextMenu, Menu, MenuItem, SelectMidi } from './index';
import { globalAnalyzer, nPlaying } from '../audio/Player';
import '../webcomponents/Piano'; // daw-piano
import '../webcomponents/PianoPlayed'; // daw-piano
import styles from './Piano.module.css';

export interface PianoProps {
	player: PitchedPlayer;
};
export function Piano(props: PianoProps) {
	const [midi, setMidi] = createSignal<MIDIInput | undefined>();
	const [pianoRef, setPianoRef] = createSignal<PianoCanvas | undefined>();

	const menu = (
		<Menu>
			<MenuItem>
				<SelectMidi onSelect={setMidi} />
			</MenuItem>
		</Menu>
	);

	return (
		<>
			<div class={styles.played}>
				<daw-analyzer
					prop:mode="spectrogram"
					prop:node={globalAnalyzer}
					prop:nPlaying={nPlaying()}
				/>
				<daw-piano-played prop:piano={pianoRef()} />
			</div>
			<ContextMenu menu={menu} class={styles.piano}>
				<daw-piano
					ref={setPianoRef}
					onNoteDown={(ev: NoteDownEvent) => {
						const { note, velocity } = ev.detail;
						props.player.playNote(note, velocity);
					}}
					onNoteUp={(ev: NoteUpEvent) => {
						const { note } = ev.detail;
						props.player.stopNote(note);
					}}
					prop:midi={midi()}
				/>
			</ContextMenu>
		</>
	);
}
