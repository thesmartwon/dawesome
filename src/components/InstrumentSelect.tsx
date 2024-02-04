import { Show, For, createSignal } from 'solid-js';

export interface InstrumentSelectProps {
	index?: SampleIndex;
	onSelect(category: string, instrument: string): void;
};
export function InstrumentSelect(props: InstrumentSelectProps) {
	return (
		<Show when={props.index} fallback={'loading index...'}>
			<For each={Object.entries(props.index as SampleIndex)}>
				{([category, instruments]) => (
					<details open={true}>
						<summary>{category}</summary>
						<For each={Object.keys(instruments)}>
							{name =>
								<button
									onClick={() => props.onSelect(category, name)}
								>
									{name}
								</button>
							}
						</For>
					</details>
				)}
			</For>
		</Show>
	);
}
