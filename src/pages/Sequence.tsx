import { Header } from '../components';
import styles from './Sequence.module.css';

export function Sequence() {
	return (
		<>
			<Header />
			<main class={styles.main}>
				<div class={styles.notes}>
					<canvas is="daw-piano" rotate="true">
						Canvas unsupported
					</canvas>
				</div>
				<div>
					sequencer
				</div>
			</main>
		</>
	);
}
