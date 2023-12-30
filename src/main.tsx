import { render } from 'preact';
import { Nav } from './nav.js';
import { Instruments } from './instruments.js';
import { Router } from 'preact-router';
import { Settings } from './settings.js';
import './minireset.css';
import './main.css';

const root = document.getElementById('root');
if (!root) throw new Error('no root element');

function App() {
	return (
		<>
			<Nav />
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
