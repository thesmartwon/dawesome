import { HttpStorage, CacheStorage, Storage } from "../smplr/storage.js";

let ctx: AudioContext | undefined;
let cache: Storage | undefined;

export function getCtx() {
	ctx ??= new AudioContext();
	return ctx;
}

export function getStorage(): Storage {
	cache ??= HttpStorage;
	return cache;
}
