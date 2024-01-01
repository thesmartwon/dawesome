export interface Instrument {
	ctx: AudioContext;
	attack(note: string, velocity: GainFactor): void;
	release(note: string): void;
}
