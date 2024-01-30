import { Header } from '../components';
import { globalPlayer } from '../audio/Player';

export function Sequence() {
	return (
		<>
			<Header />
			<span>sequence</span>
			<button onClick={async () => {
				await globalPlayer.loadUrl('kick', 'https://samples.dawesome.io/percussion/Roland%20TR-808/snare-7575.ogg');
				globalPlayer.start('kick');
			}}>play</button>
		</>
	);
}
