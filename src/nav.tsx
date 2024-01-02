import { Link } from 'preact-router';
import classes from './nav.css';

export function Nav() {
	return (
		<nav>
			<ul>
				<li>
					<img class={classes.logo} src="favicon.svg" />
				</li>
				<li>
					<Link href="/instruments">
						Instruments
					</Link>
				</li>
				<li>
					<Link href="/settings">
						Settings
					</Link>
				</li>
			</ul>
		</nav>
	);
}
