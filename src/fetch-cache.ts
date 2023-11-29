interface Sound {
	buffer: AudioBuffer;
}

export class FetchCache {
	context: AudioContext;
	cache: { [key: string]: AudioBuffer} = {};

	constructor(context: AudioContext) {
		this.context = context;
	}

	async get(url: string): Promise<AudioBuffer> {
	}
}
