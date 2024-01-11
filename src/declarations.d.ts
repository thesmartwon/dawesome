declare const SAMPLE_URL: string;
declare const APP_NAME: string;
declare type Category =
	| 'percussion'
	| 'strings'
	| 'wind'
	| 'electronic';
declare type Index = {
	[c in Category]: {
		[name: string]: string[] // files
	}
};
