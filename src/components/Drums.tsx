import { createStore, reconcile } from 'solid-js/store';
import { For, createEffect, createMemo, createSignal, onCleanup, onMount, JSX } from 'solid-js';
import { Player, Samples } from '../audio/Player';
import drumKitHatClosed from './drum-kit-hat-closed.png';
import drumKitHatOpen from './drum-kit-hat-open.png';
import styles from './Drums.module.css';

// ordered back to front visually.
const kitPiecies = {
	kick: {
		path: `M 855,556
			C 908,555 970,564 1046,640
				1057,657 1063,720 1058,766
				1060,892 1107,1006 851,1041
				704,1034 593,922 600,803
				615,587 784,558 855,556 Z`,
		center: { x: 852, y: 753 }
	},
	'tom-high': {
		path: `M 695,212
			C 790,219 827,233 832,263
				831,297 821,395 819,451
				833,468 841,527 694,529
				699,509 697,486 681,474
				627,448 596,456 543,445
				573,308 530,282 553,249
				553,239 576,208 695,212 Z`,
		center: { x: 694, y: 262 },
	},
	'tom-mid': {
		path: `M 1027,206
			C 1027,206 1148,189 1169,256
				1181,286 1162,263 1155,310
				1165,352 1174,488 1174,488
				1174,488 1078,502 1078,502
				1078,502 1081,501 1063,509
				1044,517 1050,564 1044,561
				1039,558 893,586 875,495
				885,457 888,508 872,313
				865,304 802,220 1027,206 Z`,
		center: { x: 1011, y: 271 },
	},
	'tom-low': {
		path: `M 1244,489
			C 1244,489 1450,489 1451,523
				1455,564 1444,559 1444,559
				1444,559 1441,925 1441,925
				1441,925 1452,964 1245,972
				1061,963 1059,927 1054,914
				1061,682 1055,574 1053,525
				1060,490 1244,489 1244,489 Z`,
		center: { x: 1248, y: 531 },
	},
	snare: {
		path: `M 517,445
			C 537,449 679,447 690,485
				685,518 692,599 681,644
				596,677 371,669 339,623
				283,558 333,535 340,470
				370,448 467,442 517,445 Z`,
		center: { x: 508, y: 484 },
	},
	hat: {
		path: `M 239,356
			C 323,365 412,361 403,388
				411,411 269,423 237,422
				115,412 71,416 73,386
				64,364 158,360 239,356 Z`,
		center: { x: 237, y: 387 },
	},
	crash: {
		path: 'M 222,1 a183 32 0 1 0 366 0a183 32 0 1 0 -366 0',
		transform: 'rotate(9)',
		center: { x: 392, y: 71 },
	},
	//(props: JSX.HTMLAttributes<SVGEllipseElement>) => <ellipse id="crash" cx="397" cy="64" rx="183" ry="32" transform="rotate(10)" {...props} />,
	ride: {
		path: 'M 1185,222 a235 52 0 1 0 470 0a235 52 0 1 0 -470 0',
		center: { x: 1318, y: 227 },
	},
	// (props: JSX.HTMLAttributes<SVGEllipseElement>) => <ellipse id="ride" cx="1420" cy="222" rx="235" ry="52" {...props} />,
} as { [k: string]: {
	path: string,
	transform?: string,
	center: { x: number, y: number }
} };

function hotkeyName(k: string) {
	if (k == ' ') return 'Space';
	return k;
}

export const hotkeys = {
	a: 'kick',
	s: 'snare',
	d: 'tom-high',
	f: 'tom-mid',
	g: 'tom-low',
	" ": 'hat',
	q: 'crash',
	r: 'ride',
	Shift: 'hat-pedal',
} as { [k: string]: string };
const kitHotkeys = Object.entries(hotkeys).reduce((acc, [k, v]) => {
	acc[v] = k;
	return acc;
}, {} as { [k: string]: string });

export interface DrumsProps {
	name: string;
	player: Player;
	midi?: MIDIInput;
};
export function Drums(props: DrumsProps) {
	const [samples, setSamples] = createStore<Samples>({});
	const [hatOpen, setHatOpen] = createSignal(true);

	onMount(() => {
		function onKeyDown(ev: KeyboardEvent) {
			if (ev.repeat) return;
			if (ev.key == kitHotkeys['hat-pedal']) {
				ev.preventDefault();
				setHatOpen(false);
			}
			const key = ev.key.toLowerCase();
			if (key in hotkeys) {
				ev.preventDefault();
				let sample = hotkeys[key];
				if (sample == 'hat') sample = `hat-${hatOpen() ? 'open' : 'closed'}`;
				props.player.play(sample);
			}
		}

		function onKeyUp(ev: KeyboardEvent) {
			if (ev.key == 'Shift') {
				ev.preventDefault();
				setHatOpen(true);
			}
		}

		document.addEventListener('keydown', onKeyDown);
		document.addEventListener('keyup', onKeyUp);
		onCleanup(() => {
			document.removeEventListener('keydown', onKeyDown);
			document.removeEventListener('keyup', onKeyUp);
		});
	});

	createEffect(() => {
		setSamples(reconcile(props.player.samples));
		const watching = props.player;
		props.player.onLoaded = (name, buffer) => {
			if (watching === props.player) setSamples(name, buffer);
		};
	});

	const playSample = createMemo(() => {
		return (ev: MouseEvent, name: string) => {
			ev.preventDefault();
			props.player.play(name);
		};
	});

	const buttons = createMemo(() => {
		const res = Object.entries(samples).filter(([name]) => !(name in kitPiecies));
		return res;
	});
	function Button(name: string, buffer: AudioBuffer | null) {
		return (
			<button
				disabled={!buffer}
				onClick={() => props.player.play(name)}
			>
				{name}
			</button>
		);
	}

	return (
		<div class={styles.drums}>
			<div class={styles.played}>
			</div>
			<div class={styles.grid} onMouseDown={ev => {
				// prevent double clicking from highlighting
				ev.preventDefault();
			}}>
				<div class={styles.pad}>
					<For each={buttons().slice(0, buttons().length / 2)}>
						{([name, buffer]) => Button(name, buffer)}
					</For>
				</div>
				<div class={styles.pad}>
					<For each={buttons().slice(buttons().length / 2, buttons().length)}>
						{([name, buffer]) => Button(name, buffer)}
					</For>
				</div>
				<img class={styles.drumKit} src={hatOpen() ? drumKitHatOpen : drumKitHatClosed} />
				<svg
					class={styles.drumKit}
					viewBox="0 0 1800 1248"
					xmlns="http://www.w3.org/2000/svg"
					stroke="white"
					stroke-width="2"
					fill-opacity="0"
				>
					<For each={Object.entries(kitPiecies)}>
						{([kitPiece, details]) =>
							<>
								<text
									class={styles.text}
									dominant-baseline="middle"
									x={details.center.x}
									y={details.center.y + ((kitPiece == 'hat' && !hatOpen()) ? 18 : 0)}
								>
									{hotkeyName(kitHotkeys[kitPiece])}
								</text>
								<path
									d={details.path}
									transform={details?.transform}
									onMouseDown={(ev: MouseEvent) => {
										if (ev.button != 0) return;
										let sample = kitPiece;
										if (kitPiece == 'hat') {
											sample = hatOpen() ? 'hat-open' : 'hat-closed';
										}
										playSample()(ev, sample);
									}}
								/>
							</>
						}
					</For>
					<text class={styles.text} x="400" y="1090" transform="rotate(30)" transform-origin="274 1129">
						{hotkeyName(kitHotkeys['hat-pedal'])}
					</text>
				</svg>
			</div>
		</div>
	);
}
