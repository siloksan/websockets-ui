import { RequestMessage } from '../../types';

export function isObject(value: unknown): value is object {
	return Object.prototype.toString.call(value) === '[object Object]';
}

export function isNonEmptyString(input?: unknown): input is string {
	return typeof input === 'string' && input?.length > 0;
}

export function isNullable(value: unknown): value is null | undefined {
	return value === null || typeof value === 'undefined';
}

export function isValidMessage(message: unknown): message is RequestMessage {
	return isObject(message) && 'type' in message && 'id' in message;
}
