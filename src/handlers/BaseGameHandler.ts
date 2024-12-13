import { ClientId, RequestData, TypeOfMessage, TYPES_OF_MESSAGES } from '../types';
import { RawData } from 'ws';
import { PlayerHandler } from './player';
import { parseMessage } from '../utils';
import { isValidMessage } from '../validators/common';
import { validateUserData } from '../validators/request';
import { MessageManager } from '../message-manager';

type RequestHandler = (data: RequestData, clientId: ClientId) => void;

export class BaseGameHandler {
	private readonly handlers: Map<TypeOfMessage, RequestHandler>;
	private readonly messageManager = MessageManager.getInstance();

	constructor(private readonly playerHandler: PlayerHandler) {
		this.handlers = new Map([
			[TYPES_OF_MESSAGES.reg, this.handleRegister.bind(this)],
			// [TYPES_OF_MESSAGES.create_room, this.handleCreateRoom.bind(this)],
			// [TYPES_OF_MESSAGES.add_user_to_room, this.handleAddUserToRoom.bind(this)],
			// [TYPES_OF_MESSAGES.add_ships, this.handleAddShips.bind(this)],
		]);
	}

	public handleMessage(message: RawData, clientId: ClientId) {
		if (!Buffer.isBuffer(message)) {
			throw new Error('Invalid message');
		}

		const parsedMessage = parseMessage(message);
		if (!isValidMessage(parsedMessage)) {
			throw new Error('Invalid message');
		}

		const { type, data } = parsedMessage;
		const handler = this.handlers.get(type);
		if (!handler) {
			throw new Error(`No handler for type: ${type}`);
		}

		if (typeof data === 'string') {
			const parsedData = parseMessage(data);

			if (isValidMessage(parsedData)) {
				throw new Error('Invalid message');
			}

			handler(parsedData, clientId);
		}
	}

	private handleRegister(data: RequestData, clientId: ClientId) {
		if (!validateUserData(data)) {
			this.messageManager.sendMessage(clientId, 'Invalid data');
			throw new Error('Invalid data');
		}

		this.playerHandler.createUser(data, clientId);
	}

	// public updateWinners(client: WebSocket) {
	// 	client.send(
	// 		JSON.stringify({
	// 			type: TYPES_OF_MESSAGES.update_winners,
	// 			data: {
	// 				winners: [],
	// 			},
	// 		})
	// 	);
	// }
}
