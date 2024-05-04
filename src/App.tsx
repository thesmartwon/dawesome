import { onMount, createSignal, createMemo } from 'solid-js';
import { Router, Route } from '@solidjs/router';
import { Play } from './pages/Play';
import { Sequence } from './pages/Sequence';
import { Arrange } from './pages/Arrange';
import { Context } from './audio/index';

export function App() {
	const [index, setIndex] = createSignal<SampleIndex | undefined>();
	const ctx = new Context();

	onMount(() => fetch(`${SAMPLE_BASE}/index.json`)
		.then(res => res.json() as Promise<SampleIndex>)
		.then(setIndex)
	);

	function Wrap(Component: typeof Play | typeof Sequence | typeof Arrange) {
		return () => <Component index={index()} ctx={ctx} />;
	}

	return (
		<>
			<Router>
				<Route path="/" component={Wrap(Play)} />
				<Route path="/play" component={Wrap(Play)} />
				<Route path="/sequence" component={Wrap(Sequence)} />
				<Route path="/arrange" component={Wrap(Arrange)} />
			</Router>
		</>
	);
}
