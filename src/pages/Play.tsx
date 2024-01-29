import { Header } from '../components';
import { Piano } from '../Piano';
import styles from './Play.module.css';

export function Play() {
	const canvas = (
		<canvas class={styles.canvas}>
			No 2d context available
		</canvas>
	) as HTMLCanvasElement;
	new Piano(
		canvas,
		450,
		k => console.log('down', k),
		k => console.log('up', k),
	);

	return (
		<>
			<Header />
			{canvas}
		</>
	);
}
