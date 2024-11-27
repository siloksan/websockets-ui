export function isObject(value: unknown): value is object {
	return Object.prototype.toString.call(value) === '[object Object]';
}
