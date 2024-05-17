import { createSignal } from 'solid-js';
import { Note } from 'tonal';
import { Synth } from '../audio/index';
import { Piano as PianoCanvas, NoteUpEvent, NoteDownEvent } from '../webcomponents/Piano';
import { ContextMenu, Menu, MenuItem, SelectMidi, NodeEditor } from './index';
import '../webcomponents/Piano'; // daw-piano
import '../webcomponents/PianoPlayed'; // daw-piano
import styles from './Piano.module.css';

// https://www.midi.org/specifications/file-format-specifications/dls-downloadable-sounds/dls-level-1
export function midiVelToGain(vel: number) {
  return (vel * vel) / 16129; // 16129 = 127 * 127
}

function getFreq(note: string): number {
	const res = Note.freq(note);
	if (!res) throw new Error('could not parse frequency for note ' + note);
	return res;
}

export interface PianoProps {
	player: Synth;
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

				//<daw-analyzer mode="spectrograph" prop:analyzer={props.player.ctx.analyzer} />
				//<daw-piano-played prop:piano={pianoRef()} />
	return (
		<>
			<div class={styles.played}>
				<NodeEditor />
			</div>
			<ContextMenu menu={menu} class={styles.piano}>
				<daw-piano
					ref={setPianoRef}
					onNoteDown={(ev: NoteDownEvent) => {
						const { note, velocity } = ev.detail;
						const freq = getFreq(note);
						const gain = midiVelToGain(velocity);
						props.player.attack(freq, { gain });
					}}
					onNoteUp={(ev: NoteUpEvent) => {
						const { note } = ev.detail;
						const freq = getFreq(note);
						props.player.release(freq);
					}}
					prop:midi={midi()}
				/>
			</ContextMenu>
		</>
	);
}
