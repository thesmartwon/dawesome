import { HttpStorage, CacheStorage, Storage } from "../smplr/storage.js";

let ctx: AudioContext | undefined;

export function getCtx() {
	ctx ??= new AudioContext();
	return ctx;
}

export function getStorage(): Storage {
	return HttpStorage;
}
