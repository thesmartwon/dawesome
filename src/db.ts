import type { SampleOptions } from './smplr/player/types.js';

const DB_NAME = APP_NAME;
const DB_VERSION = 1; // Must be positive int
let db: IDBDatabase;

export const eventEmitter = new class extends EventTarget {
	broadcast(name: string) {
		this.dispatchEvent(new Event(name));
	}
}

export type Instrument = {
	id?: number;
	name: string;
	category: Category;
	detune?: number;
	volume?: number;
	velocity?: number;
	decayTime?: number;
	lpfCutoffHz?: number;
};
export type InstrumentSample = {
	instrumentId: number;
	name: string;
	url: string;
} & SampleOptions;

export function open() {
	const req = indexedDB.open(DB_NAME, DB_VERSION);
	req.onsuccess = () => db = req.result;
	req.onerror = (evt: any) => {
		console.error("openDb:", evt.target.error);
		throw evt.target.error;
	};

	req.onupgradeneeded = (evt: any) => {
		console.log("openDb.onupgradeneeded");
		db = evt.target.result;
		const instruments = db.createObjectStore("instruments", { autoIncrement: true });
		instruments.createIndex('name', 'name', { unique: true });
		instruments.createIndex('category', 'category');
		// instruments.createIndex('detune', 'detune');
		// instruments.createIndex('volume', 'volume');
		// instruments.createIndex('velocity', 'velocity');
		// instruments.createIndex('decayTime', 'decayTime');
		// instruments.createIndex('lpfCutoffHz', 'lpfCutoffHz');

		const instrumentSamples = db.createObjectStore("instrumentSamples", { autoIncrement: true });
		instrumentSamples.createIndex('instrumentIdName', ['instrumentId', 'name'], { unique: true });
		instrumentSamples.createIndex('url', 'url');
		// instrumentSamples.createIndex('decayTime', 'decayTime');
		// instrumentSamples.createIndex('detune', 'detune');
		// instrumentSamples.createIndex('duration', 'duration');
		// instrumentSamples.createIndex('velocity', 'velocity');
		// instrumentSamples.createIndex('lpfCutoffHz', 'lpfCutoffHz');
		// instrumentSamples.createIndex('loop', 'loop');
		// instrumentSamples.createIndex('loopStart', 'loopStart');
		// instrumentSamples.createIndex('loopEnd', 'loopEnd');
		// instrumentSamples.createIndex('gainOffset', 'gainOffset');
	};
}

async function promisify<T>(req: IDBRequest<any>): Promise<T> {
	let objectStore = req.source;
	while (!(objectStore instanceof IDBObjectStore)) {
		if ('objectStore' in objectStore) objectStore = objectStore.objectStore;
		else break;
	}
	if (objectStore instanceof IDBObjectStore && objectStore.transaction.mode === 'readwrite') {
		eventEmitter.broadcast(objectStore.name);
	}
	return new Promise((res, rej) => {
		req.onsuccess = (evt: any) => res(evt.target.result);
		req.onerror = (evt: any) => rej(evt.target.error);
		setTimeout(() => rej(new Error('timeout')), 1000);
	});
}

export async function getInstruments(): Promise<Instrument[]> {
	const store = db.transaction('instruments').objectStore('instruments');
	const keys = await promisify<number[]>(store.getAllKeys());
	const values = await promisify<Instrument[]>(store.getAll());

	values.forEach((v, i) => v.id = keys[i]);
	return values;
}

export async function addInstrument(instrument: Omit<Instrument, 'id'>): Promise<number> {
	const req = db
		.transaction('instruments', 'readwrite')
		.objectStore('instruments')
		.add(instrument);

	return promisify(req);
}

export async function deleteInstrument(key: number): Promise<void> {
	const transaction = db.transaction(['instruments', 'instrumentSamples'], 'readwrite');
	const req = transaction
		.objectStore('instruments')
		.delete(key);
	const req2 = transaction
		.objectStore('instrumentSamples')
		.delete(IDBKeyRange.bound([key], [key, []]));

	return Promise.all([promisify(req), promisify(req2)]).then(() => {});
}

export async function putInstrument(instrument: Instrument): Promise<number> {
	const key = instrument.id;
	const req = db
		.transaction('instruments', 'readwrite')
		.objectStore('instruments')
		.put(instrument, key);

	return promisify(req);
}

export async function getInstrumentSamples(key: number): Promise<InstrumentSample[]> {
	const req = db
		.transaction('instrumentSamples')
		.objectStore('instrumentSamples')
		.index('instrumentIdName')
		.getAll(IDBKeyRange.bound([key], [key, []]));

	return promisify(req);
}

export async function addInstrumentSample(sample: InstrumentSample): Promise<void> {
	const req = db
		.transaction('instrumentSamples', 'readwrite')
		.objectStore('instrumentSamples')
		.add(sample, [sample.instrumentId, sample.name]);

	return promisify(req);
}

export async function deleteInstrumentSample(instrumentId: number, name: string): Promise<void> {
	const req = db
		.transaction('instrumentSamples', 'readwrite')
		.objectStore('instrumentSamples')
		.delete([instrumentId, name]);

	return promisify(req);
}
