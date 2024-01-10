import { JSX } from 'preact';
import { classnames } from '../helpers.js';
import classes from './header.css';

export interface HeaderProps extends Omit<JSX.HTMLAttributes<HTMLHeadingElement>, 'onChange'> {
	value: string;
	onChange: (ev: JSX.TargetedFocusEvent<HTMLHeadingElement>, n: string) => void;
	contentEditable?: boolean;
	is?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
};
export function Header({
	value,
	onChange,
	is = 'h2',
	contentEditable = true,
	...props
}: HeaderProps) {
	const Component = is;
	return (
		<Component
			class={classnames(classes.header, contentEditable && classes.cursor)}
			contentEditable={contentEditable}
			onBlur={ev => onChange(ev, ev.currentTarget.innerText)}
			{...props}
		>
			{value}
		</Component>
	);
}
