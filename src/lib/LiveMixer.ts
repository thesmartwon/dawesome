import { Sound } from './Sound.js';

export class LiveMixer {
	context: AudioContext;
	analyser: AnalyserNode;

	constructor() {
		this.context = new AudioContext();
		this.analyser = this.context.createAnalyser();
		this.analyser.connect(this.context.destination);
	}

	async addSound(url: string, category?: string, subcategory?: string): Promise<Sound> {
		return await Sound.init(this.context, url);
	}
}
