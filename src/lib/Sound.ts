export class Sound {
	static cache: { [key: string]: Sound } = {};
	static max_preview_samples = 4096;

	context: AudioContext;
	buffer: AudioBuffer;
	preview: Float32Array;

	constructor(context: AudioContext, buffer: AudioBuffer) {
		let values = buffer.getChannelData(0);
		if (values.length > Sound.max_preview_samples) {
			const resampled = new Float32Array(Sound.max_preview_samples);
			// down sample to Sound.max_preview_samples values
			for (let i = 0; i < Sound.max_preview_samples; i++) {
				const sample = Math.floor((i / Sound.max_preview_samples) * values.length);
				resampled[i] = values[sample];
			}
			values = resampled;
		}

		this.context = context;
		this.buffer = buffer;
		this.preview = values;
	}

	static async init(context: AudioContext, url: string): Promise<Sound> {
		if (url in Sound.cache) return Sound.cache[url];

		return fetch(url)
			.then(res => res.arrayBuffer())
			.then(async res => {
				return context.decodeAudioData(res).then(buf => {
					Sound.cache[url] = new Sound(context, buf);
					return Sound.cache[url];
				});
			});
	}

	createBufferSource(sink: AudioNode) {
		const node = this.context.createBufferSource();
		node.buffer = this.buffer
		node.connect(sink);
		return node;
	}
}

