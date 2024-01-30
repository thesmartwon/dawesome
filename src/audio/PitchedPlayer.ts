import { Player } from './Player';
import { Note } from 'tonal';

export type NoteUrl = {
	freq: number;
	url: string;
};

export type NoteUrlGain = NoteUrl & {
	gain: number;
};

function sampleName(layer: number, freq: number) {
	return `${layer}-${freq}`;
}

function closest(n: number, list: number[]): number {
	return list.reduce((prev, cur) => Math.abs(cur - n) < Math.abs(prev - n) ? cur : prev);
}

/// This is how the MIDI association converts midi velocity [0..127] into gain [0..1]
/// @see https://www.midi.org/specifications/file-format-specifications/dls-downloadable-sounds/dls-level-1
export function midiVelToGain(vel: number) {
  return (vel * vel) / 16129; // 16129 = 127 * 127
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

// Will detune notes to play new ones.
export class PitchedPlayer extends Player {
	layers: { [gainStart: number]: { [freqency: number]: undefined } } = {};
	playing: { [freq: number]: ReturnType<Player["start"]>[] } = {};

	async loadLayer(noteUrls: NoteUrl[], gainStart: number = 0) {
		this.layers[gainStart] ??= [];

		const promises: Promise<any>[] = [];
		for (let i = 0; i < noteUrls.length; i++) {
			const noteUrl = noteUrls[i];
			const name = sampleName(gainStart, noteUrl.freq);
			promises.push(super.loadUrl(name, noteUrl.url));
			this.layers[gainStart][noteUrl.freq] = undefined;
		}

		return Promise.all(promises);
	}

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

	play(freq: number, gain: number, decayTime = 0.5) {
		// desc
		const gains = Object.keys(this.layers).map(Number).sort((a, b) => b - a);
		let layer = closest(gain, gains);

		const frequencies = Object.keys(this.layers[layer]).map(Number);
		const nearest = closest(freq, frequencies);
		const name = sampleName(layer, nearest);
		const dir = nearest < freq ? 1 : -1;
		const cents = 1200 * Math.log2(freq / nearest) * dir;
		console.log('play', freq, 'layer', layer, 'closest', nearest, 'cents', cents, 'gain', gain);

		const res = super.start(name, gain, cents, decayTime);
		this.playing[freq] ??= [];
		this.playing[freq].push(res);
		return res;
	}

	stop(freq: number) {
		(this.playing[freq] || []).forEach(stopper => stopper && stopper());
		this.playing[freq] = [];
	}

	playNote(note: string, velocity: number) {
		const freq = Note.freq(note);
		if (!freq) {
			console.warn('could not parse frequency for note', note);
			return;
		}
		const gain = midiVelToGain(velocity);

		return this.play(freq, gain);
	}

	stopNote(note: string) {
		const freq = Note.freq(note);
		if (!freq) {
			console.warn('could not parse frequency for note', note);
			return;
		}

		return this.stop(freq);
	}
}
