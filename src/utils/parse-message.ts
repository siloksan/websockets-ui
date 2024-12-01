import { RequestMessage, RequestData } from '../types';

export function parseMessage(message: Buffer<ArrayBufferLike> | string): RequestMessage | RequestData {
	const messageString = typeof message === 'string' ? message : message.toString('utf-8');
	return JSON.parse(messageString);
}
