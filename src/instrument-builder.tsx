import type { UserIndex } from './types.js';
import { JSX } from 'preact';
import { Signal } from '@preact/signals';
import { useState, useMemo, useEffect } from 'preact/hooks';
import { Sampler, Sample } from './smplr/sampler.js';
import classes from './instrument-builder.css';
import { getCtx } from './lib/ctx.js';
import { ExternalLink } from './icons/index.js';
import { standardKit } from './input/percussion/sound.js'
import { classnames } from './helpers.js';

function isError(e: any) {
 return e && e.stack && e.message;
};

interface SampleEditorProps {
	sampler: Sampler;
	sample: Sample;
	onChange: () => void;
	editableName?: boolean;
}
function SampleEditor({ sampler, sample, onChange, editableName }: SampleEditorProps) {
	const [state, setState] = useState(sample.state);
	useEffect(() => {
		sample.onStateChange = setState;
	}, []);

	function rename(ev: JSX.TargetedFocusEvent<HTMLHeadingElement>) {
		const newName = ev.currentTarget.innerText;
		if (sampler.samples[newName]) {
			ev.currentTarget.innerText = sample.name;
			return;
		}
		sampler.rename(sample.name, newName);
		onChange();
	}

	function stopPropagation(ev: JSX.TargetedMouseEvent<any>) {
		ev.stopPropagation();
	}

	return (
		<button
			class={classes.editor}
			disabled={sample.state !== 'success'}
			onMouseDown={() => sampler.start({ note: sample.name })}
		>
			<div class={classes.editorTitle}>
				<h3
					contenteditable={editableName}
					onMouseDown={editableName ? stopPropagation : () => {}}
					onBlur={rename}
				>
					{sample.name}
				</h3>
				<button
					onMouseDown={stopPropagation}
					onClick={() => {
						sampler.delete(sample.name);
						onChange();
					}}
				>
					x
				</button>
			</div>
			<label>
				<input
					value={sample.url}
					class={classnames(
						state === 'loading' && classes.loading,
						isError(state) && classes.failed,
					)}
					{...(state !== 'success' && { title: state.toString() })}
					onMouseDown={stopPropagation}
					onChange={ev => {
						sample.url = ev.currentTarget.value;
						onChange();
					}}
					onBlur={() => {
						console.log('onBlur');
						delete sample.buffer;
						sampler.loadSample(sample);
					}}
				/>
				<a href={sample.url} onMouseDown={stopPropagation} target="_blank">
					<ExternalLink />
				</a>
			</label>
		</button>
	);
}

function getSample(d: DataTransfer): Sample {
	const url = d.getData('text/uri-list');
	const name = d.getData('name');
	const buffer = window.dragBuffer;
	return { url, name, state: buffer ? 'success' : 'loading', buffer };
}

interface DropZoneProps {
	sampler: Sampler;
	sampleName: string;
	userIndex: Signal<UserIndex>;
	useDragName?: boolean;
	editableName?: boolean;
}
function DropZone({ sampler, sampleName, userIndex, useDragName = false, editableName = true }: DropZoneProps) {
	const samples = sampler.samples;

	return (
		<li
			class={classes.dropZone}
			onDragOver={ev => ev.preventDefault()}
			onDrop={ev => {
				ev.preventDefault();
				if (!ev.dataTransfer) return;
				const sample = getSample(ev.dataTransfer);
				if (!useDragName) sample.name = sampleName;
				sampler.add(sample);
				userIndex.value = { ...userIndex.value, [sampler.name]: sampler.samples };
			}}
		>
			{samples[sampleName]
				? <SampleEditor
						sampler={sampler}
						sample={samples[sampleName]}
						onChange={() => userIndex.value = { ...userIndex.value }}
						editableName={editableName}
					/>
				: sampleName
			}
		</li>
	);
}

interface InstrumentBuilderProps {
	name: string;
	userIndex: Signal<UserIndex>;
};
export function InstrumentBuilder({ name: inName, userIndex }: InstrumentBuilderProps) {
	const [name, setName] = useState(inName);
	useEffect(() => setName(inName), [inName]);
	const sampler = useMemo(() => new Sampler(getCtx(), inName, { samples: userIndex.value[inName] }), [inName]);
	const samples = sampler.samples;

	if (Object.keys(userIndex.value).length === 0) {
		return (
			<div class={classes.builder}>
				Create a new instrument in the panel on the left.
			</div>
		);
	}

	function onBlur(ev: JSX.TargetedFocusEvent<HTMLHeadingElement>) {
		const newName = ev.currentTarget.innerText;
		if (userIndex.value[newName]) {
			ev.currentTarget.innerText = name;
			return;
		}
		userIndex.value[newName] = userIndex.value[name];
		delete userIndex.value[name];
		userIndex.value = { ...userIndex.value };
		setName(newName);
	}

	return (
		<div class={classes.builder}>
			<h2 class={classes.h2} contenteditable onBlur={onBlur}>
				{name}
			</h2>
			<ol class={classes.standardKit}>
				{Object.keys(standardKit).map(k =>
					<DropZone userIndex={userIndex} sampler={sampler} sampleName={k} editableName={false} />
				)}
			</ol>
			<ul>
				{Object.values(samples).filter(s => !(s.name in standardKit)).map(s =>
					<DropZone userIndex={userIndex} sampler={sampler} sampleName={s.name} />
				)}
				<DropZone userIndex={userIndex} sampler={sampler} sampleName="misc" useDragName />
			</ul>
		</div>
	);
}
