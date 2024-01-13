import { dark } from '../settings.js';
import type { PageProps } from './pages.js';

export default function Settings(_: PageProps) {
	return (
		<form onSubmit={ev => ev.preventDefault()}>
			<label>
				dark mode
				<input type="checkbox" checked={dark.value} onChange={() => {
					dark.value = !dark.value;
				}} />
			</label>
		</form>
	);
}
