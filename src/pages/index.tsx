import { Link } from 'preact-router';
import type { PageProps } from './pages.js';

export default function Intro(_: PageProps) {
	return (
		<div>
			Welcome to Dawesome!
			Play and create instruments in the <Link href="/instruments">instruments tab</Link> and
			compose them in the <Link href="/sequencer">sequencer tab</Link>.
		</div>
	);
}
