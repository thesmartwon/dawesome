import { Router, Route } from "@solidjs/router";
import { Play } from './pages';

function App() {
	return (
		<>
			<Router>
				<Route path="/" component={Play} />
				<Route path="/play" component={Play} />
			</Router>
		</>
	);
}

export default App;
