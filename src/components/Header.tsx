import { A } from '@solidjs/router';
import styles from './Header.module.css';
import { OcThreebars2 } from 'solid-icons/oc'
import { globalGain, globalAnalyzer } from '../audio/Player';
import { createSignal, createEffect, Switch, Match, onMount } from 'solid-js';
import { IoVolumeHighOutline, IoVolumeMediumOutline, IoVolumeLowOutline, IoVolumeOffOutline } from 'solid-icons/io'
import { AnalyzerCanvas } from './AnalyzerCanvas';

export function Header() {
	const [volume, setVolume] = createSignal(globalGain.gain.value * 100);
	let canvas: HTMLCanvasElement | undefined;

	onMount(() => {
		if (!canvas) return;
		new AnalyzerCanvas(canvas, globalAnalyzer);
	});

	createEffect(() => {
		globalGain.gain.value = volume() / 100;
	});

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
			<canvas height="100%" width="300px" ref={canvas} />
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
