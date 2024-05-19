import { Node, Ports } from './Node';
import { Context } from '../Context';

export class Sink implements Node {
	static controls = {};
	static width = 100;
	static height = 64;

	static inputPorts: Ports = { node: { type: 'audionode' } };
	static outputPorts: Ports = {};

	constructor(public to: Context) {}
};
