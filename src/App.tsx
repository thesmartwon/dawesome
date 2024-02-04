import { onMount, createSignal } from 'solid-js';
import { Router, Route } from '@solidjs/router';
import { Play } from './pages/Play';
import { Sequence } from './pages/Sequence';
import { Arrange } from './pages/Arrange';

function App() {
	const [index, setIndex] = createSignal<SampleIndex | undefined>();

	onMount(() => fetch(`${SAMPLE_BASE}/index.json`)
		.then(res => res.json() as Promise<SampleIndex>)
		.then(setIndex)
	);

	return (
		<>
			<Router>
				<Route path="/" component={() => <Play index={index()} />} />
				<Route path="/play" component={() => <Play index={index()} />} />
				<Route path="/sequence" component={Sequence} />
				<Route path="/arrange" component={Arrange} />
			</Router>
		</>
	);
}

export default App;
