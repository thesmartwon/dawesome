import type { UserIndex } from './types.js';
import { Signal } from '@preact/signals';
import { useState, useMemo } from 'preact/hooks';
import { Sampler, Sample } from './smplr/sampler.js';
import classes from './instrument-builder.css';
import { getCtx, getStorage } from './lib/ctx.js';
import { Play, ExternalLink } from './icons/index.js';
import { loadAudioBuffer } from './smplr/player/load-audio.js';

interface SampleEditorProps {
	sampler: Sampler;
	sample: Sample;
	onDelete: () => void;
	onChange: () => void;
}
function SampleEditor({ sampler, sample, onDelete, onChange }: SampleEditorProps) {
	const [loading, setLoading] = useState(false);

	return (
		<div class={classes.editor}>
			<div>
				<button disabled={loading} onMouseDown={() => sampler.start({ note: sample.name })}>
					<Play />
				</button>
				<button onClick={() => {
					sampler.delete(sample.name);
					onDelete();
				}}>
					Delete
				</button>
			</div>
			<label>
				note
				<input value={sample.name} onChange={ev => {
					const newName = ev.currentTarget.value;
					sampler.rename(sample.name, newName);
					sample.name = newName;
					onChange();
				}} />
			</label>
			<label>
				<a href={sample.url} target="_blank">
					url <ExternalLink />
				</a>
				<input value={sample.url} onChange={ev => {
					sample.url = ev.currentTarget.value;
					onChange();
				}} />
				<button onClick={async () => {
					setLoading(true);
					sampler.player.buffers[sample.name] = await loadAudioBuffer(sampler.context, sample.url, getStorage());
					setLoading(false);
				}}>
					Load
				</button>
			</label>
		</div>
	);
}

interface InstrumentBuilderProps {
	name: string;
	userIndex: Signal<UserIndex>;
};
export function InstrumentBuilder({ name, userIndex }: InstrumentBuilderProps) {
	const [oldName, setOldName] = useState(name);
	const sampler = useMemo(() => new Sampler(getCtx(), name, { samples: userIndex.value[name] }), [name]);
	const samples = sampler.samples;

	return (
		<div
			onDragOver={ev => {
				ev.preventDefault();
			}}
			onDrop={ev => {
				ev.preventDefault();
				if (!ev.dataTransfer) return;
				const url = ev.dataTransfer.getData('text/uri-list');
				const sampleName = ev.dataTransfer.getData('name');
				sampler.add({ url, name: sampleName, buffer: window.dragBuffer });
				userIndex.value = {
					...userIndex.value,
					[name]: sampler.samples
				};
			}}
			style={{ height: '100%' }}
		>
			<h2
				contenteditable
				onInput={ev => {
					const newName = ev.currentTarget.innerText;
					userIndex.value[newName] = userIndex.value[oldName];
					delete userIndex.value[oldName];
					userIndex.value = { ...userIndex.value };
					setOldName(newName);
				}}>
				{name}
			</h2>
			{Object.keys(samples).length === 0 && 'Drag a sound here.'}
			{Object.values(samples).map(s =>
				<SampleEditor
					sampler={sampler}
					sample={s}
					onDelete={() => sampler.delete(s.name)}
					onChange={() => {
						console.log('onChange', userIndex.value);
						userIndex.value = { ...userIndex.value };
					}}
				/>
			)}
		</div>
	);
}
