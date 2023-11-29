import { render } from 'preact'
import { Instruments } from './instruments.js';
import './minireset.css';

const root = document.getElementById('root');
if (!root) throw new Error('no root element');

function App() {
	return (
		<Instruments />
	)
}

render(
	<App />,
	document.getElementById('root') as HTMLElement
)
