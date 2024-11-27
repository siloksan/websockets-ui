import { Message } from '../types';

export function parseMessage(message: Buffer<ArrayBufferLike>): Message {
	const messageString = message.toString('utf-8');
	return JSON.parse(messageString);
}
