import { render } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { Nav } from './nav.js';
import { Instruments } from './instruments.js';
import { Sequencer } from './sequencer.js';
import { Router } from 'preact-router';
import { Settings, sampleUrl } from './settings.js';
import classes from './main.css';
import { Intro } from './intro.js';
import { open } from './db.js';

const root = document.getElementById('root');
if (!root) throw new Error('no root element');

function IndexComponent({ index, Component, ...props }: any) {
	if (index) return <Component index={index} {...props} />;

	return <>loading...</>;
}

function App() {
	const [index, setIndex] = useState<Index | null>(null);
	useEffect(() => {
		fetch(sampleUrl + '/index.json').then(res => res.json()).then(setIndex);
	}, [sampleUrl.value]);
	useEffect(open, []);

	return (
		<>
			<Nav class={classes.header} />
			<div class={classes.page}>
				<Router>
					<Intro path="/" />
					<IndexComponent index={index} path="/instruments" Component={Instruments} />
					<IndexComponent index={index} path="/sequencer" Component={Sequencer} />
					<Settings path="/settings" />
				</Router>
			</div>
		</>
	)
}

render(
	<App />,
	document.getElementById('root') as HTMLElement
);
