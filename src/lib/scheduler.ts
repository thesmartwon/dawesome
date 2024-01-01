interface Beat {
	num: number;
	time: number;
};
// https://web.dev/articles/audio-scheduling
// https://github.com/cwilso/metronome/blob/main/js/metronome.js
export class Scheduler {
	ctx: AudioContext;
	playing = false;

	bpm: number;
	beatNum: number;

	nextNoteTime: number;
	scheduleAheadTime: number;
	tempo: number;

	queue: Beat[];

	constructor(ctx: AudioContext) {
		this.ctx = ctx;
	}

	tick() {
    while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
			// push a note on the queue, even if we're not playing. useful for visualization.
			this.queue.push({ num: this.beatNum, time: this.nextNoteTime } );

			// create an oscillator
			// var osc = this.ctx.createOscillator();
			// osc.connect( this.ctx.destination );
			// osc.frequency.value = 220.0;
			// osc.start( time );
			// osc.stop( time + noteLength );

			var secondsPerBeat = 60.0 / this.tempo;
			this.nextNoteTime += 0.25 * secondsPerBeat;
			this.beatNum++;
    }
	}

	start() {
		this.playing = true;
		this.nextNoteTime = this.ctx.currentTime;
		this.beatNum = 0;
	}

	pause() {
		this.playing = false;
	}

	stop() {
		this.playing = false;
		this.beatNum = 0;
	}
}
