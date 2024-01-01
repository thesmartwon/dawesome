import { render } from 'preact';
import { Nav } from './nav.js';
import { Instruments } from './instruments.js';
import { Router } from 'preact-router';
import { Settings } from './settings.js';
import classes from './main.css';

const root = document.getElementById('root');
if (!root) throw new Error('no root element');

function App() {
	return (
		<>
			<div class={classes.header}>
				<Nav />
			</div>
			<Router>
				<Instruments path="/" />
				<Instruments path="/instruments" />
				<Settings path="/settings" />
			</Router>
		</>
	)
}

render(
	<App />,
	document.getElementById('root') as HTMLElement
);
