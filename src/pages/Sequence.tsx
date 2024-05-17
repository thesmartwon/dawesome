import { createSignal } from 'solid-js';
import { Piano as PianoCanvas } from '../webcomponents/Piano';
import '../webcomponents/Piano'; // daw-piano
import '../webcomponents/Sequencer'; // daw-sequencer
import { Header } from '../components';
import { Context } from '../audio/index';
import styles from './Sequence.module.css';

export interface SequenceProps {
	index?: SampleIndex;
	ctx: Context;
};
export function Sequence(props: SequenceProps) {
	const [pianoRef, setPianoRef] = createSignal<PianoCanvas | undefined>();

	return (
		<>
			<Header ctx={props.ctx} />
			<main class={styles.main}>
				<daw-piano class={styles.notes} ref={setPianoRef} rotate="true" />
				<daw-sequencer class={styles.sequencer} prop:piano={pianoRef()} />
			</main>
		</>
	);
}
