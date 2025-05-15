import { isNonEmptyString, isValidMessage } from '../validators/common';
import { RequestMessage, RequestData, ID } from '../types';
import { RawData } from 'ws';
import { BaseGameHandler } from '../handlers/base-game-handler';

export function handleMessage(message: RawData, clientId: ID, baseHandler: BaseGameHandler) {
	if (!Buffer.isBuffer(message)) {
		throw new Error('Invalid message');
	}

	const parsedMessage = parseMessage(message);
	if (!isValidMessage(parsedMessage)) {
		throw new Error('Invalid message');
	}

	const { type, data } = parsedMessage;
	const handler = baseHandler.handlers.get(type);
	if (!handler) {
		throw new Error(`No handler for type: ${type}`);
	}

	// data may be additionally stringified
	if (typeof data === 'string') {
		const parsedData = parseMessage(data);

		if (isValidMessage(parsedData)) {
			throw new Error('Invalid message');
		}

		handler({ data: parsedData, clientId });
	}
}

export function parseMessage(message: Buffer<ArrayBufferLike> | string): RequestMessage | RequestData {
	const messageString = typeof message === 'string' ? message : message.toString('utf-8');

	return isNonEmptyString(messageString) ? JSON.parse(messageString) : messageString;
}
