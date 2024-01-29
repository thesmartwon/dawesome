import { Router, Route } from '@solidjs/router';
import { Play } from './pages/Play';
import { Sequence } from './pages/Sequence';
import { Arrange } from './pages/Arrange';

function App() {
	return (
		<>
			<Router>
				<Route path="/" component={Play} />
				<Route path="/play" component={Play} />
				<Route path="/sequence" component={Sequence} />
				<Route path="/arrange" component={Arrange} />
			</Router>
		</>
	);
}

export default App;
