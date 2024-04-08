import { A } from '@solidjs/router';
import styles from './Header.module.css';
import { OcThreebars2 } from 'solid-icons/oc'
import { globalGain } from '../audio/Player';
import { createSignal, createEffect, Switch, Match } from 'solid-js';
import { IoVolumeHighOutline, IoVolumeMediumOutline, IoVolumeLowOutline, IoVolumeOffOutline } from 'solid-icons/io'

export interface HeaderProps {
	onToggle?(): void;
	ref?: HTMLElement;
};
export function Header(props: HeaderProps) {
	const [volume, setVolume] = createSignal(globalGain.gain.value * 100);
	const [lastVolume, setLastVolume] = createSignal(volume());

	createEffect(() => {
		globalGain.gain.value = volume() / 100;
	});

	function toggleMute() {
		if (volume() > 0) {
			setLastVolume(volume());
			setVolume(0);
		} else {
			setVolume(lastVolume());
		}
	}

	const aprops = {
		class: styles.link,
		activeClass: styles.active,
	};
	return (
		<nav class={styles.nav} ref={props.ref}>
			<OcThreebars2 size="1.5em" onClick={props.onToggle} />
			<A {...aprops} href="/play">Play</A>
			<A {...aprops} href="/sequence">Sequence</A>
			<A {...aprops} href="/arrange">Arrange</A>
			<div class={styles.analyzer}>
				<canvas is="daw-analyzer" height="74" />
			</div>
			<button onClick={toggleMute}>
				<Switch>
					<Match when={volume() > 75}>
						<IoVolumeHighOutline size="1.5em" />
					</Match>
					<Match when={volume() > 25}>
						<IoVolumeMediumOutline size="1.5em" />
					</Match>
					<Match when={volume() > 0}>
						<IoVolumeLowOutline size="1.5em" />
					</Match>
					<Match when={volume() == 0}>
						<IoVolumeOffOutline size="1.5em" />
					</Match>
				</Switch>
			</button>
			<input
				type="range"
				min="0"
				max="100"
				value={volume()}
				onInput={ev => setVolume(+ev.target.value)}
			/>
		</nav>
	);
}
