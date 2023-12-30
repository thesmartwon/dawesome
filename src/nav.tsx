import { Link } from 'preact-router';

export function Nav() {
	return (
		<nav>
			<ul>
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
