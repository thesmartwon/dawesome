import { render } from 'preact';
import type { Index, UserIndex } from './types.js';
import { useState, useEffect } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { Nav } from './nav.js';
import { Instruments } from './instruments.js';
import { Sequencer } from './sequencer.js';
import { Router } from 'preact-router';
import { Settings, sampleUrl } from './settings.js';
import classes from './main.css';
import { Intro } from './intro.js';

const root = document.getElementById('root');
if (!root) throw new Error('no root element');

function IndexComponent({ index, Component, ...props }: any) {
	if (index) return <Component index={index} {...props} />;

	return <>loading...</>;
}

function saveUserIndex(index: UserIndex) {
	localStorage.setItem('userIndex', JSON.stringify(index));
}

function loadUserIndex(): UserIndex {
	const existing = localStorage.getItem('userIndex');
	if (!existing) return { 'Custom percussion': {} };
	return JSON.parse(existing);
}

function App() {
	const [index, setIndex] = useState<Index | null>(null);
	const userIndex = useSignal<UserIndex>(loadUserIndex());
	useEffect(() => {
		userIndex.subscribe(saveUserIndex);
	}, []);

	useEffect(() => {
		fetch(sampleUrl + '/index.json').then(res => res.json()).then(i => setIndex(i));
	}, [sampleUrl.value]);

	return (
		<>
			<Nav class={classes.header} />
			<div class={classes.page}>
				<Router>
					<Intro path="/" />
					<IndexComponent index={index} userIndex={userIndex} path="/instruments" Component={Instruments} />
					<IndexComponent index={index} userIndex={userIndex} path="/sequencer" Component={Sequencer} />
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
