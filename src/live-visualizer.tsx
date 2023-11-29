import { useRef } from 'preact/hooks';
import classes from './visualizer.css';

export function LiveVisualizer({ analyser }: { analyser: AnalyserNode }) {
	const ref = useRef<HTMLCanvasElement>(null);

	const bufferLength = analyser.frequencyBinCount;
	const dataArray = new Uint8Array(bufferLength);

	function draw() {
		if (!ref.current) return;
		analyser.getByteTimeDomainData(dataArray);
		const canvas = ref.current;
		const canvasCtx = canvas.getContext('2d');
		if (!canvasCtx) return;
		canvasCtx.fillStyle = "rgb(200, 200, 200)";
		canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

		canvasCtx.lineWidth = 2;
		canvasCtx.strokeStyle = "rgb(0, 0, 0)";
		canvasCtx.beginPath();

		const sliceWidth = (canvas.width * 1.0) / bufferLength;
		let x = 0;

		for (let i = 0; i < bufferLength; i++) {
			const v = dataArray[i] / 128.0;
			const y = (v * canvas.height) / 2;

			if (i === 0) {
				canvasCtx.moveTo(x, y);
			} else {
				canvasCtx.lineTo(x, y);
			}

			x += sliceWidth;
		}

		canvasCtx.lineTo(canvas.width, canvas.height / 2);
		canvasCtx.stroke();
		requestAnimationFrame(draw);
	}
	requestAnimationFrame(draw);

	return (
		<canvas class={classes.vis} ref={ref} />
	);
}
