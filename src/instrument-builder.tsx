import { JSX } from 'preact';
import { useState, useEffect, useMemo } from 'preact/hooks';
import { Sampler, Sample, Samples } from './smplr/sampler.js';
import classes from './instrument-builder.css';
import { ExternalLink } from './icons/index.js';
import { standardKit } from './input/soundboard.js'
import { classnames } from './helpers.js';
import { Heading } from './input/heading.js';
import {
	addInstrumentSample,
	getInstrumentSamples,
	Instrument,
	InstrumentSample,
	putInstrument,
	eventEmitter,
	deleteInstrumentSample,
} from './lib/db.js';
import { useSignal } from '@preact/signals';

function isError(e: any) {
 return e && e.stack && e.message;
};

declare global {
	interface Window { dragBuffer?: AudioBuffer; }
}

interface SampleEditorProps {
	sampler: Sampler;
	sample: Sample;
	instrumentId: number;
	editableName: boolean;
}
function SampleEditor({ sampler, sample, instrumentId, editableName }: SampleEditorProps) {
	const [name, setName] = useState(sample.name);
	const [state, setState] = useState(sample.state);
	useEffect(() => {
		setState(sample.state);
		sample.onStateChange = setState;
	}, [sample]);

	function rename(ev: any, newName: string) {
		if (sampler.samples[newName]) {
			ev.currentTarget.innerText = sample.name;
			return;
		}
		setName(newName);
		sampler.rename(sample.name, newName);
	}

	function stopPropagation(ev: JSX.TargetedMouseEvent<any>) {
		ev.stopPropagation();
	}

	return (
		<button
			class={classes.editor}
			disabled={sample.state !== 'success'}
			onMouseDown={() => sampler.start({ note: sample.name })}
			draggable
			onDragStart={ev => {
				if (!ev.dataTransfer) return;
				ev.dataTransfer.dropEffect = "copy";
				const uri = sample.url;
				ev.dataTransfer.setData('text/uri-list', uri);
				ev.dataTransfer.setData('text/plain', uri);
				ev.dataTransfer.setData('name', sample.name);
				// Saves serializing or fetching + converting
				window.dragBuffer = sample.buffer;
			}}
			onDragEnd={() => window.dragBuffer = undefined}
		>
			<div class={classes.titleRow}>
				<Heading is="h3"
					value={name}
					onChange={rename}
					contentEditable={editableName}
					onMouseDown={editableName ? stopPropagation : () => {}}
				/>
				<button
					onMouseDown={stopPropagation}
					onClick={() => {
						sampler.delete(sample.name);
						deleteInstrumentSample(instrumentId, sample.name);
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
					onChange={ev => sample.url = ev.currentTarget.value}
					onBlur={() => {
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

function isSample(d: DataTransfer): boolean {
	return d.types.includes('text/uri-list') || window.dragBuffer instanceof AudioBuffer;
}

interface DropZoneProps {
	sampler: Sampler;
	sampleName: string;
	instrumentId: number;
	useDragName?: boolean;
	editableName?: boolean;
}
function DropZone({
	sampler,
	sampleName,
	instrumentId,
	useDragName = false,
	editableName = true
}: DropZoneProps) {
	const [sample, setSample] = useState(sampler.samples[sampleName]);
	useEffect(() => setSample(sampler.samples[sampleName]), [sampler.samples, sampleName]);

	return (
		<li
			class={classes.dropZone}
			onDragOver={ev => {
				ev.preventDefault();
				let className = classes.willReject;
				if (ev.dataTransfer && isSample(ev.dataTransfer)) className = classes.willAccept;
				ev.currentTarget.classList.add(className);
			}}
			onDragLeave={ev => ev.currentTarget.classList.remove(classes.willAccept, classes.willReject)}
			onDrop={ev => {
				ev.preventDefault();
				ev.currentTarget.classList.remove(classes.willAccept, classes.willReject);
				if (!ev.dataTransfer) return;
				const url = ev.dataTransfer.getData('text/uri-list');
				const name = useDragName ? ev.dataTransfer.getData('name') : sampleName;
				const buffer = window.dragBuffer;
				if (!url && !buffer) return;
				let instrumentSample: InstrumentSample = { instrumentId, url, name };
				addInstrumentSample(instrumentSample);
				const sample: Sample = {
					url,
					name,
					buffer,
					state: buffer ? 'success' : 'loading'
				};
				sampler.add(sample);
				if (!useDragName) setSample(sample);
			}}
		>
			{sample
				? <SampleEditor
						sampler={sampler}
						sample={sample}
						instrumentId={instrumentId}
						editableName={editableName}
					/>
				: sampleName
			}
		</li>
	);
}

interface InstrumentBuilderProps {
	instrument?: Instrument;
};
export function InstrumentBuilder({ instrument: inInstrument }: InstrumentBuilderProps) {
	const instrument = useSignal({ ...inInstrument });
	const sampler = useMemo(() => new Sampler(), []);

	useEffect(() => {
		function fetchSamples() {
			if (!inInstrument?.id) return;
			getInstrumentSamples(inInstrument.id).then(instrumentSamples => {
				sampler.samples = instrumentSamples.reduce((acc, cur) => {
					acc[cur.name] = sampler.samples[cur.name] || { ...cur, state: 'loading' };
					return acc;
				}, {} as Samples);
				sampler.load();
				instrument.value = { ...inInstrument };
			});
		}
		fetchSamples();

		eventEmitter.addEventListener('instrumentSamples', fetchSamples);
		return () => eventEmitter.removeEventListener('instrumentSamples', fetchSamples);
	}, [inInstrument?.id]);

	if (!instrument.value.id) {
		return (
			<div class={classes.builder}>
				Select a user instrument from the panel on the left.
			</div>
		);
	}

	function onRename(ev: any, newName: string) {
		if (!instrument.value) return;
		const oldName = instrument.value.name;
		putInstrument({ category: '', ...instrument.value, name: newName })
			.catch(err => {
				// Name already taken
				if (err.name == 'ConstraintError') ev.target.innerText = oldName;
			});
	}

	const dropZoneProps = { instrumentId: instrument.value.id as number, sampler };

	return (
		<div class={classes.builder}>
			<Heading value={instrument.value.name} onChange={onRename} />
			<ol class={classes.standardKit}>
				{Object.keys(standardKit).map(k =>
					<DropZone {...dropZoneProps} sampleName={k} editableName={false} />
				)}
			</ol>
			<ul>
				{Object.values(sampler.samples)
					.filter(s => !(s.name in standardKit))
					.map(s =>
						<DropZone {...dropZoneProps} sampleName={s.name} />
					)}
				<DropZone {...dropZoneProps} sampleName="+" useDragName />
			</ul>
		</div>
	);
}
