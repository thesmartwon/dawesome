import { Sound } from './lib/Sound.js';
import { useRef, useEffect } from 'preact/hooks';
import classes from './visualizer.css';

function scale(
	v: number,
	inMin: number,
	inMax: number,
	outMin: number,
	outMax: number
): number {
	return ((v - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
}

function drawDataArray(canvas: HTMLCanvasElement, values: Float32Array) {
	const context = canvas.getContext('2d');
	if (!context) return;
	context.fillStyle = "rgb(200, 200, 200)";
	context.fillRect(0, 0, canvas.width, canvas.height);

	context.lineWidth = 2;
	context.strokeStyle = "rgb(0, 0, 0)";
	context.beginPath();

	const max = 1;
	const min = 0;

	const lineWidth = 3;
	context.lineWidth = lineWidth;
	context.beginPath();
	for (let i = 0; i < values.length; i++) {
		const v = values[i];
		const x = scale(
			i,
			0,
			values.length,
			lineWidth,
			canvas.width - lineWidth
		);
		const y = scale(v, max, min, 0, canvas.height - lineWidth);
		if (i === 0) {
			context.moveTo(x, y);
		} else {
			context.lineTo(x, y);
		}
	}
	context.lineCap = "round";
	context.strokeStyle = "white";
	context.stroke();
}

export function Visualizer({ sound }: { sound: Sound }) {
	const ref = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		if (!ref.current) return;
		drawDataArray(ref.current, sound.preview);
	}, [ref.current]);

	return (
		<canvas class={classes.vis} ref={ref} />
	);
}
