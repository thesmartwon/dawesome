import { Link } from 'preact-router';
import classes from './nav.css';

export function Nav({ class: myClass }: { class: string }) {
	return (
		<nav class={myClass}>
			<ul>
				<li><Link href="/"><img class={classes.logo} src="favicon.svg" /></Link></li>
				<li><Link href="/instruments">Instruments</Link> </li>
				<li><Link href="/sequencer">Sequencer</Link> </li>
				<li><Link href="/settings">Settings</Link></li>
			</ul>
		</nav>
	);
}
