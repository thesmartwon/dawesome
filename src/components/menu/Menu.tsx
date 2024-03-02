import { JSX, createSignal, onCleanup, onMount, Show, createEffect } from 'solid-js';
import styles from './Menu.module.css';

export interface ContextMenuProps extends JSX.HTMLAttributes<HTMLUListElement> {
	label?: JSX.Element;
	isFlyout?: boolean;
	children?: JSX.Element;
}
export function Menu(props: ContextMenuProps) {
	const [open, setOpen] = createSignal(!props.isFlyout);
	let ul: HTMLUListElement | undefined;

	const close = () => setOpen(false);

	onMount(() => {
		if (!props.isFlyout) return;
		const parent = ul?.parentElement;
		parent?.addEventListener('mouseenter', () => {
			setOpen(true);
			const rect = parent.getBoundingClientRect();
			ul?.style.setProperty('top', `${rect.y}px`);
			ul?.style.setProperty('left', `${rect.x + rect.width}px`);
		});
		const grandparent = parent?.parentElement;
		grandparent?.addEventListener('mousemove', ev => {
			if (ev.target instanceof HTMLElement && !parent?.contains(ev.target)) setOpen(false);
		});

		document.addEventListener('click', close);
		document.addEventListener('contextmenu', close);
		onCleanup(() => {
			document.removeEventListener('click', close);
			document.removeEventListener('contextmenu', close);
		});
	});

	return (
		<ul
			{...props}
			ref={ul}
			classList={{
				[styles.menu]: true,
				[styles.flyout]: props.isFlyout,
				[props.class ?? '']: true,
			}}
			style={{ ...(!open() && { display: 'none' })}}
		>
			<Show when={open()}>
				{props.children}
			</Show>
		</ul>
	);
}
