import { createSignal } from 'solid-js';
import { Piano as PianoCanvas } from '../webcomponents/Piano';
import '../webcomponents/Piano'; // daw-piano
import '../webcomponents/Sequencer'; // daw-sequencer
import { Header } from '../components';
import styles from './Sequence.module.css';

export function Sequence() {
	const [pianoRef, setPianoRef] = createSignal<PianoCanvas | undefined>();

	return (
		<>
			<Header />
			<main class={styles.main}>
				<daw-piano class={styles.notes} ref={setPianoRef} rotate="true" />
				<daw-sequencer class={styles.sequencer} prop:piano={pianoRef()} />
			</main>
		</>
	);
}
