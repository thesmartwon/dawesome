export function classnames(...args: any): string {
	const classes = [] as string[];
	const hasOwn = {}.hasOwnProperty;

	args.filter(Boolean).forEach((arg: any) => {
		const argType = typeof arg;

		if (argType === 'string' || argType === 'number') {
			classes.push(arg);
		} else if (Array.isArray(arg) && arg.length) {
			const inner = classnames(...(arg as any));
			if (inner) {
				classes.push(inner);
			}
		} else if (argType === 'object') {
			for (const key in arg) {
				if (hasOwn.call(arg, key) && arg[key]) {
					classes.push(key);
				}
			}
		}
	});

	return classes.join(' ');
}

export function range(start: number, stop: number, step: number = 1) {
  return Array.from({ length: (stop - start) / step + 1 }, (_, index) => start + index * step);
}

