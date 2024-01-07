export type Category =
	| 'percussion'
	| 'strings'
	| 'wind'
	| 'electronic';

export type Index = {
	[k: string]: {
		[k: string]: string[];
	}
};
