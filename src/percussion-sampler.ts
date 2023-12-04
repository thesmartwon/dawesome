import { Sampler, ToneBufferSource } from 'tone';
import { optionsFromArguments } from 'tone/Tone/core/util/Defaults';

export class PercussionSampler extends Sampler {
	private _activeSources: Map<string, ToneBufferSource[]> = new Map();

	constructor() {
		super(optionsFromArguments(Sampler.getDefaults(), arguments, ["urls", "onload", "baseUrl"], "urls"));
		const options = optionsFromArguments(Sampler.getDefaults(), arguments, ["urls", "onload", "baseUrl"], "urls");

		this._buffers = new ToneAudioBuffers({
			urls: urlMap,
			onload: options.onload,
			baseUrl: options.baseUrl,
			onerror: options.onerror,
		});
		this.attack = options.attack;
		this.release = options.release;
		this.curve = options.curve;

		// invoke the callback if it's already loaded
		if (this._buffers.loaded) {
			// invoke onload deferred
			Promise.resolve().then(options.onload);
		}
	}
}
