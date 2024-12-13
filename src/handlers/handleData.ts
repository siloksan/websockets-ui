import WebSocket, { RawData } from 'ws';
import { RequestData, TYPES_OF_MESSAGES, WebSocketClients } from '../types';
import { PlayerHandler } from './player';
import { parseMessage } from '../utils/parse-message';
import { isValidMessage } from '../validators/common';
import { RoomHandler } from './room';
import { WinnersHandler } from './winner';
import { SHIPS_STORAGE } from '../data-storage';
import { ShipsHandler } from './ships';

export const webSocketClients: WebSocketClients = new Map();

const playerHandler = new PlayerHandler();
const roomHandler = new RoomHandler(webSocketClients);
const winnerHandler = new WinnersHandler();
const shipsHandler = new ShipsHandler(SHIPS_STORAGE);

export const handlers = {
	[TYPES_OF_MESSAGES.reg]: (client: WebSocket, data: RequestData, clientId: number) => {
		playerHandler.createUser(client, data, clientId);
		roomHandler.updateRoom();
		winnerHandler.updateWinners(client);
	},

	[TYPES_OF_MESSAGES.create_room]: (client: WebSocket, data: RequestData, clientId: number) => {
		roomHandler.createRoom(client, data, clientId);
		roomHandler.updateRoom();
	},

	[TYPES_OF_MESSAGES.add_user_to_room]: (client: WebSocket, data: RequestData, clientId: number) => {
		roomHandler.addUserToRoom(client, data, clientId);
		roomHandler.updateRoom();
	},

	[TYPES_OF_MESSAGES.add_ships]: (client: WebSocket, data: RequestData, clientId: number) => {
		shipsHandler.addShips(client, data, clientId);
		// roomHandler.addUserToRoom(client, data, clientId);
		// roomHandler.updateRoom();
	},
};

export function handleData(ws: WebSocket, message: RawData, clientId: number) {
	if (!Buffer.isBuffer(message)) {
		throw new Error('Invalid message');
	}

	const parsedMessage = parseMessage(message);
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

		handler(ws, parsedData, clientId);
	}
}
