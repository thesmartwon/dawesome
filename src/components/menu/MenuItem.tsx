import { JSX } from 'solid-js';
import styles from './Menu.module.css';

export interface ContextMenuItemProps extends JSX.HTMLAttributes<HTMLLIElement> {
	children?: JSX.Element;
}
export function MenuItem(props: ContextMenuItemProps) {
	return (
		<li {...props} class={`${styles.item} ${props.class ?? ''}`}>
			{props.children}
		</li>
	);
}
