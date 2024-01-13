import { render } from 'preact';
import { Suspense, lazy } from 'preact/compat';
import { useState, useEffect } from 'preact/hooks';
import { Nav } from './nav.js';
import { Router } from 'preact-router';
import { pages } from './pages/pages.js';
import { openDb } from './lib/db.js';
import settings from './settings.js';
import classes from './main.css';

function App() {
	const [index, setIndex] = useState<Index>({});
	useEffect(() => {
		fetch(SAMPLE_URL + '/index.json').then(res => res.json()).then(setIndex);
		openDb();
	}, []);

	return (
		<>
			<Nav class={classes.header} />
			<div class={classes.page}>
				<Router>
					{Object.entries(pages).map(([path, promise]) => {
						const LazyComponent = lazy(promise) as any;
						return (
							<Suspense path={path} fallback={<div>loading...</div>}>
								<LazyComponent index={index} settings={settings} />
							</Suspense>
						);
					})}
				</Router>
			</div>
		</>
	)
}

const root = document.getElementById('root');
if (!root) throw new Error('no root element');
render(<App />, root);
