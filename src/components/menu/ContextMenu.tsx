import { JSX, createSignal, Show, onMount, onCleanup, splitProps } from 'solid-js';
import { Portal } from 'solid-js/web';

type Position = { x: number, y: number };

export interface ContextMenuProps extends JSX.HTMLAttributes<HTMLDivElement> {
	children: JSX.Element;
	menu: JSX.Element;
	onOpen?(): void;
};
export function ContextMenu(props: ContextMenuProps) {
	const [position, setPosition] = createSignal<Position | undefined>();
	function onContext(ev: MouseEvent) {
		ev.preventDefault();
		setPosition({ x: ev.pageX, y: ev.pageY })
		if (props.onOpen) props.onOpen();
	}
	const unset = () => setPosition();
	onMount(() => {
		document.addEventListener('click', unset);
		onCleanup(() => {
			document.removeEventListener('click', unset);
		});
	});

  const [_, others] = splitProps(props, ['children', 'menu']);


	return (
		<div onContextMenu={onContext} {...others}>
			{props.children}
			<Show when={position()}>
				<Portal>
					<div style={{
						position: 'absolute',
						top: `${position()?.y}px`,
						left: `${position()?.x}px`,
						...(!position() && { display: 'none' })
					}}>
						{props.menu}
					</div>
				</Portal>
			</Show>
		</div>
	);
}
