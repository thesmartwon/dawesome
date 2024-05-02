import { AutoResizeCanvas } from './AutoResizeCanvas';

export class AnalyzerCanvas extends AutoResizeCanvas {
	static observedAttributes = ['nPlaying', 'mode', ...super.observedAttributes];

	dataArray = new Uint8Array();
	_node?: AnalyserNode;
	_nPlaying = 0;
	_timeout = 0;
	mode: 'oscilliscope' | 'spectrometer' | 'spectrogram' | undefined;
	speed = 1;

	set node(n: AnalyserNode) {
		this._node = n;
		this.dataArray = new Uint8Array(Math.max(n.fftSize, n.frequencyBinCount));
	}

	set nPlaying(n: number) {
		this._nPlaying = n;
		clearTimeout(this._timeout);
		if (n > 0) {
			this.dirty = true;
		} else {
			this._timeout = setTimeout(() => this.dirty = false, this.canvas.width / this.speed + 500);
		}
	}

	render(time: DOMHighResTimeStamp) {
		const ctx = this.ctx();
		const { width, height } = ctx.canvas;

		const style = getComputedStyle(document.body)
		const background = style.getPropertyValue('--color--background-100') || '200, 200, 200';
		ctx.fillStyle = `rgb(${background})`;
		ctx.lineWidth = 2;
		ctx.strokeStyle = "rgb(0, 0, 0)";

		const bufferLength = (this.mode == 'oscilliscope'
			? this._node?.fftSize
			: this._node?.frequencyBinCount) ?? 1;
		const sliceWidth = (width * 1.0) / bufferLength;
		let x = 0;
		let y = height;

		if (this.mode == 'oscilliscope') {
			// Each array value is a sample, the magnitude of the signal at a particular time.
			this._node?.getByteTimeDomainData(this.dataArray);

			ctx.fillRect(0, 0, width, height);
			ctx.beginPath();
			ctx.moveTo(0, height / 2);

			for (let i = 0; i < bufferLength; i++) {
				const v = this.dataArray[i] - 128;
				y = height / 2 + (v / 128 * height * .5);

				ctx.lineTo(x, y);

				x += sliceWidth;
			}

			ctx.lineTo(width, height / 2);
			ctx.stroke();
		} else if (this.mode == 'spectrometer') {
			// Each item in the array represents the decibel value for a specific frequency.
			// The frequencies are spread linearly from 0 to 1/2 of the sample rate.
			// For example, for 48000 sample rate, the last item of the array will
			// represent the decibel value for 24000 Hz.
			this._node?.getByteFrequencyData(this.dataArray);

			ctx.fillRect(0, 0, width, height);
			ctx.beginPath();

			for (let i = 0; i < bufferLength; i++) {
				let value = this.dataArray[i];
				if (true) {
					const logIndex = this.logScale(i, bufferLength);
					value = this.dataArray[logIndex];
				}

				ctx.fillStyle = this.getColor(value, background);
				y = height - (value / 256) * height;

				if (i == 0) {
					ctx.moveTo(x, y);
				} else {
					ctx.lineTo(x, y);
				}

				x += sliceWidth;
			}

			ctx.stroke();
		} else if (this.mode == 'spectrogram') {
			this._node?.getByteFrequencyData(this.dataArray);

			// Move what's here to the left
			const dt = time - this.prevTime;
			const shift = this.speed * dt;
			ctx.globalCompositeOperation = "copy";
			ctx.drawImage(ctx.canvas, -shift, 0);
			ctx.globalCompositeOperation = "source-over";

			x = width;

			for (let i = 0; i < bufferLength; i++) {
				let value = this.dataArray[i];
				if (true) {
					const logIndex = this.logScale(i, bufferLength);
					value = this.dataArray[logIndex];
				}

				const percent = i / bufferLength;
				y = Math.round(percent * height);

				ctx.fillStyle = this.getColor(value, background);
				ctx.fillRect(x - shift, height - y, shift, shift);
			}

			ctx.stroke();
		} else {
			ctx.fillStyle = 'red';
			ctx.font = '32px serif';
			ctx.textAlign = 'center';
			ctx.fillText('set valid mode', width / 2, height / 2);
		}
	}

	getColor(value: number, background: string) {
		const b = background.split(',').map(Number);
		const palette = {
			0: b,
			10:  [ 75, b[1], 159],
			20:  [104, b[1], 251],
			30:  [131, b[1], 255],
			40:  [155,  18,  157],
			50:  [175,  37,  b[2]],
			60:  [191,  59,  b[2]],
			70:  [206,  88,  b[2]],
			80:  [223, 132,  b[2]],
			90:  [240, 188,  b[2]],
			100: [255, 252,  b[2]]
		};

		//floor to nearest 10:
		const decimalised = 100 * value / 255
		const floored = 10 * Math.floor(decimalised / 10) as keyof typeof palette;

		const color = [
			palette[floored][0],
			palette[floored][1],
			palette[floored][2],
		];

		return "rgb(" + color[0] +", "+color[1] +"," + color[2]+")";
	}

	logScale(index: number, total: number) {
		var base = 2;
		var logmax = this.logBase(total + 1, base);
		var exp = logmax * index / total;
		return Math.round(Math.pow(base, exp) - 1);
	}

	logBase(val: number, base: number) {
		return Math.log(val) / Math.log(base);
	}
}

customElements.define('daw-analyzer', AnalyzerCanvas);
