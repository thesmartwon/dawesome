import { Player } from './Player';
import { Note } from 'tonal';

export type NoteUrlGain = {
	freq: number;
	url: string;
	gain: number;
};

function sampleName(layer: number, freq: number) {
	return `${layer}-${freq}`;
}

function closest(n: number, list: number[]): number {
	return list.reduce((prev, cur) => Math.abs(cur - n) < Math.abs(prev - n) ? cur : prev);
}

// https://www.midi.org/specifications/file-format-specifications/dls-downloadable-sounds/dls-level-1
export function midiVelToGain(vel: number) {
  return (vel * vel) / 16129; // 16129 = 127 * 127
}

function getFreq(note: string): number {
	const res = Note.freq(note);
	if (!res) throw new Error('could not parse frequency for note ' + note);
	return res;
}

export type Dynamic = 'ppppp' | 'pppp' | 'ppp' | 'pp' | 'p' | 'mp' | 'mf' | 'f' | 'ff' | 'fff' | 'ffff';
// https://en.wikipedia.org/wiki/Dynamics_(music)#Interpretation_by_notation_programs
export function dynamicToGain(dynamic: Dynamic): number {
	// Copy MuseScore 3.0
	switch (dynamic) {
		case 'ppppp': return midiVelToGain(5);
		case 'pppp': return midiVelToGain(10);
		case 'ppp': return midiVelToGain(16);
		case 'pp': return midiVelToGain(33);
		case 'p': return midiVelToGain(49);
		case 'mp': return midiVelToGain(64);
		case 'mf': return midiVelToGain(80);
		case 'f': return midiVelToGain(96);
		case 'ff': return midiVelToGain(112);
		case 'fff': return midiVelToGain(126);
		case 'ffff': return midiVelToGain(127);
		default: return 1;
	}
}

// Will detune samples to play unavailable ones.
export class PitchedPlayer extends Player {
	layers: { [gainStart: number]: { [freqency: number]: undefined } } = {};
	playing: { [freq: number]: ReturnType<Player["play"]>[] } = {};

	async loadLayers(notes: NoteUrlGain[]) {
		const promises: Promise<any>[] = [];
		for (let i = 0; i < notes.length; i++) {
			const note = notes[i];
			const name = sampleName(note.gain, note.freq);
			promises.push(super.loadUrl(name, note.url));

			this.layers[note.gain] ??= [];
			this.layers[note.gain][note.freq] = undefined;
		}

		return Promise.all(promises);
	}

	playFreq(freq: number, gain: number) {
		const gains = Object.keys(this.layers).map(Number);
		const layer = closest(gain, gains);

		const frequencies = Object.keys(this.layers[layer]).map(Number);
		const nearest = closest(freq, frequencies);
		const name = sampleName(layer, nearest);

		const detuneCents = 1200 * Math.log2(freq / nearest);

		const res = super.play(name, { gain, detuneCents });
		this.playing[freq] ??= [];
		this.playing[freq].push(res);
		return res;
	}

	stopFreq(freq: number) {
		(this.playing[freq] || []).forEach(stopper => stopper && stopper());
		this.playing[freq] = [];
	}

	playNote(note: string, velocity: number) {
		const freq = getFreq(note);
		const gain = midiVelToGain(velocity);

		return this.playFreq(freq, gain);
	}

	stopNote(note: string) {
		const freq = getFreq(note);

		return this.stopFreq(freq);
	}
}
