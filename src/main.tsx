import { render } from 'preact';
import { Nav } from './nav.js';
import { Instruments } from './instruments.js';
import { Router } from 'preact-router';
import { Settings } from './settings.js';
import './minireset.css';
import classes from './main.css';

const root = document.getElementById('root');
if (!root) throw new Error('no root element');

function App() {
	return (
		<>
			<Nav />
			<div class={classes.router}>
				<Router>
					<Instruments path="/" />
					<Instruments path="/instruments" />
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
