import { A } from '@solidjs/router';
import styles from './Header.module.css';
import { OcThreebars2 } from 'solid-icons/oc'

export function Header() {
	const aprops = {
		class: styles.link,
		activeClass: styles.active,
	};
	return (
		<nav class={styles.nav}>
			<OcThreebars2 size="1.5em" />
			<A {...aprops} href="/play">Play</A>
			<A {...aprops} href="/sequence">Sequence</A>
			<A {...aprops} href="/arrange">Arrange</A>
			<div class={styles.spacer} />
		</nav>
	);
}
