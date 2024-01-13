import type { SampleOptions } from '../smplr/player/types.js';

const DB_NAME = APP_NAME;
const DB_VERSION = 1; // Must be positive int
let cachedDb: IDBDatabase | undefined;

export const eventEmitter = new class extends EventTarget {
	broadcast(name: string) {
		this.dispatchEvent(new Event(name));
	}
}

export type Instrument = {
	id?: number;
	name: string;
	category: string;
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

export type InstrumentSequenceNote = {
	name: string;
	beat: number;
};
export type InstrumentSequence = {
	id?: number;
	type: 'pad' | 'roll';
	name: string;
	bpm: number;
	notes: InstrumentSequenceNote[];
	instrumentId?: number;
} & SampleOptions;

export async function openDb(): Promise<IDBDatabase> {
	if (cachedDb) return cachedDb;

	return new Promise((res, rej) => {
		const req = indexedDB.open(DB_NAME, DB_VERSION);
		req.onsuccess = () => {
			cachedDb = req.result;
			res(cachedDb);
		};
		req.onerror = (evt: any) => rej(evt.target.error);

		req.onupgradeneeded = (evt: any) => {
			console.log('onupgradeneeded');
			cachedDb = evt.target.result as IDBDatabase;
			const instruments = cachedDb.createObjectStore('instruments', { autoIncrement: true });
			instruments.createIndex('name', 'name', { unique: true });
			instruments.createIndex('category', 'category');

			const instrumentSamples = cachedDb.createObjectStore('instrumentSamples', { autoIncrement: true });
			instrumentSamples.createIndex('instrumentIdName', ['instrumentId', 'name'], { unique: true });
			instrumentSamples.createIndex('url', 'url');

			const sequences = cachedDb.createObjectStore('sequences', { autoIncrement: true });
			sequences.createIndex('name', 'name', { unique: true });
			sequences.createIndex('bpm', 'bpm');
		};
	});
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
	const db = await openDb();
	const store = db.transaction('instruments').objectStore('instruments');
	const keys = await promisify<number[]>(store.getAllKeys());
	const values = await promisify<Instrument[]>(store.getAll());

	values.forEach((v, i) => v.id = keys[i]);
	return values;
}

export async function addInstrument(instrument: Omit<Instrument, 'id'>): Promise<number> {
	const db = await openDb();
	const req = db
		.transaction('instruments', 'readwrite')
		.objectStore('instruments')
		.add(instrument);

	return promisify(req);
}

export async function deleteInstrument(key: number): Promise<void> {
	const db = await openDb();
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
	const db = await openDb();
	const key = instrument.id;
	const req = db
		.transaction('instruments', 'readwrite')
		.objectStore('instruments')
		.put(instrument, key);

	return promisify(req);
}

export async function getInstrumentSamples(key: number): Promise<InstrumentSample[]> {
	const db = await openDb();
	const req = db
		.transaction('instrumentSamples')
		.objectStore('instrumentSamples')
		.index('instrumentIdName')
		.getAll(IDBKeyRange.bound([key], [key, []]));

	return promisify(req);
}

export async function addInstrumentSample(sample: InstrumentSample): Promise<void> {
	const db = await openDb();
	const req = db
		.transaction('instrumentSamples', 'readwrite')
		.objectStore('instrumentSamples')
		.add(sample, [sample.instrumentId, sample.name]);

	return promisify(req);
}

export async function deleteInstrumentSample(instrumentId: number, name: string): Promise<void> {
	const db = await openDb();
	const req = db
		.transaction('instrumentSamples', 'readwrite')
		.objectStore('instrumentSamples')
		.delete([instrumentId, name]);

	return promisify(req);
}

export async function getSequences(): Promise<InstrumentSequence[]> {
	const db = await openDb();
	const store = db.transaction('sequences').objectStore('sequences');
	const keys = await promisify<number[]>(store.getAllKeys());
	const values = await promisify<InstrumentSequence[]>(store.getAll());

	values.forEach((v, i) => v.id = keys[i]);
	return values;
}

export async function addSequence(sequence: InstrumentSequence): Promise<number> {
	const db = await openDb();
	const req = db
		.transaction('sequences', 'readwrite')
		.objectStore('sequences')
		.add(sequence);

	return promisify(req);
}

export async function putSequence(sequence: InstrumentSequence): Promise<number> {
	const db = await openDb();
	const key = sequence.id;
	const req = db
		.transaction('instruments', 'readwrite')
		.objectStore('instruments')
		.put(sequence, key);

	return promisify(req);
}

export async function deleteSequence(key: number): Promise<void> {
	const db = await openDb();
	const req = db
		.transaction('sequences', 'readwrite')
		.objectStore('sequences')
		.delete(key);

	return promisify(req);
}
