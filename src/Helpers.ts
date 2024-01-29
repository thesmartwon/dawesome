export function debounce(fn: Function, ms = 100) {
	let timeoutId: ReturnType<typeof setTimeout>;
	return function (this: any, ...args: any[]) {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn.apply(this, args), ms);
	};
};

export function clamp(
	n: number,
	min: number,
	max: number,
): number {
	if (n < min) return min;
	else if (n > max) return max;
	return n;
}
