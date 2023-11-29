import type { JSX } from 'preact';
import type { LiveMixer } from './lib/LiveMixer.js';
import type { Sound } from './lib/Sound.js';
import { useState } from 'preact/hooks';
import { Visualizer } from './visualizer.js';

interface PlayerProps {
	mixer: LiveMixer;
}

export function Player({ mixer }: PlayerProps) {
	const [url, setUrl] = useState('/percussion/Bentley Rhythm Ace/kick.wav');
	const [sound, setSound] = useState<Sound | null>(null);

	function onChange(ev: JSX.TargetedEvent<HTMLInputElement, Event>) {
		setUrl(ev.currentTarget.value);
	}

	async function onClick() {
		const s = await mixer.addSound(url);
		s.createBufferSource(mixer.analyser).start();
		setSound(s);
	}

	return (
		<>
			<input value={url} onChange={onChange} />
			<button onClick={onClick}>
				Fetch and play
			</button>
			{sound && <Visualizer sound={sound} />}
		</>
	);
}
