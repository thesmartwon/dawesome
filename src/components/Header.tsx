import { A } from "@solidjs/router";
import Hamburger from '../icons/hamburger.svg';
import styles from './Header.module.css';

export function Header() {
	return (
		<nav>
			<Hamburger width="1.5em" height="1.5em" />
			<A class={styles.link} activeClass={styles.active} href="/play">Play</A>
			<A class={styles.link} activeClass={styles.active} href="/sequence">Sequence</A>
			<A class={styles.link} activeClass={styles.active} href="/arrange">Arrange</A>
		</nav>
	);
}
