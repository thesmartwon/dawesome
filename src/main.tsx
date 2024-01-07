import { render } from 'preact';
import type { Index } from './types.js';
import { useState, useEffect } from 'preact/hooks';
import { Nav } from './nav.js';
import { Instruments } from './instruments.js';
import { Sequencer } from './sequencer.js';
import { Router } from 'preact-router';
import { Settings } from './settings.js';
import classes from './main.css';

const root = document.getElementById('root');
if (!root) throw new Error('no root element');

function App() {
	const [index, setIndex] = useState<Index>({});

	useEffect(() => {
		fetch(SAMPLE_URL + '/index.json').then(res => res.json()).then(i => setIndex(i));
	}, []);

	return (
		<>
			<div class={classes.header}>
				<Nav />
			</div>
			<Router>
				<Instruments path="/" />
				<Instruments index={index} path="/instruments" />
				<Sequencer index={index} path="/sequencer" />
				<Settings path="/settings" />
			</Router>
		</>
	)
}

render(
	<App />,
	document.getElementById('root') as HTMLElement
);
