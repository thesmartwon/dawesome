let ctx: AudioContext | undefined;

export function getCtx() {
	ctx ??= new AudioContext();
	return ctx;
}
