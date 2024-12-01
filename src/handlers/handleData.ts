import WebSocket, { RawData } from 'ws';
import { RequestData, TYPES_OF_MESSAGES } from '../types';
import { playerHandler } from './player';
import { parseMessage } from '../utils/parse-message';
import { isValidMessage } from '../validators';
import { roomHandler } from './room';
import { winnerHandler } from './winner';

export const handlers = {
	[TYPES_OF_MESSAGES.reg]: (client: WebSocket, data: RequestData) => {
		playerHandler.createUser(client, data);
		roomHandler.updateRoom(client);
		winnerHandler.updateWinners(client);
	},
};

export function handleData(ws: WebSocket, message: RawData) {
	if (!Buffer.isBuffer(message)) {
		throw new Error('Invalid message');
	}

	const parsedMessage = parseMessage(message);
	console.log('parsedMessage: ', parsedMessage);
	if (!isValidMessage(parsedMessage)) {
		throw new Error('Invalid message');
	}

	const { type, data } = parsedMessage;
	const handler = handlers[type];
	if (!handler) {
		throw new Error(`No handler for type: ${type}`);
	}

	if (typeof data === 'string') {
		const parsedData = parseMessage(data);

		if (isValidMessage(parsedData)) {
			throw new Error('Invalid message');
		}

		handler(ws, parsedData);
	}
}
