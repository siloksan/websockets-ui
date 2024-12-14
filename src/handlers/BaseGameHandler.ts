import { ClientId, RequestData, TypeOfMessage, TYPES_OF_MESSAGES } from '../types';
import { PlayerHandler } from './player';
import {
	validateAddShipsData,
	validateAddUserToRoomData,
	validateCreateRoomData,
	validateUserData,
} from '../validators/request';
import { MessageManager } from '../message-manager';
import { RoomHandler } from './room';
import { ShipsHandler } from './ships';
import { LaunchHandler } from './launch';

type RequestOptions = {
	data?: RequestData;
	clientId: ClientId;
};
type RequestHandler = (options: RequestOptions) => void;

export class BaseGameHandler {
	public readonly handlers: Map<TypeOfMessage, RequestHandler>;
	private readonly messageManager = MessageManager.getInstance();

	constructor(
		private readonly playerHandler: PlayerHandler,
		private readonly roomHandler: RoomHandler,
		private readonly shipsHandler: ShipsHandler,
		private readonly launchHandler: LaunchHandler
	) {
		this.handlers = new Map([
			[TYPES_OF_MESSAGES.reg, this.handleRegister.bind(this)],
			[TYPES_OF_MESSAGES.disconnect, this.handleDisconnect.bind(this)],
			[TYPES_OF_MESSAGES.create_room, this.handleCreateRoom.bind(this)],
			[TYPES_OF_MESSAGES.add_user_to_room, this.handleAddUserToRoom.bind(this)],
			[TYPES_OF_MESSAGES.add_ships, this.handleAddShips.bind(this)],
		]);
	}

	private handleDisconnect({ clientId }: RequestOptions) {
		this.messageManager.unregisterClient(clientId);
		this.roomHandler.removeUserInRoom(clientId);
		this.roomHandler.updateRoom();
	}

	private handleRegister({ data, clientId }: RequestOptions) {
		if (!validateUserData(data)) {
			this.messageManager.sendMessage(clientId, 'Invalid data');
			throw new Error('Invalid data');
		}

		this.playerHandler.createUser(data, clientId);
		this.roomHandler.updateRoom();
	}

	private handleCreateRoom({ data, clientId }: RequestOptions) {
		if (!validateCreateRoomData(data)) {
			this.messageManager.sendMessage(clientId, 'Invalid data');
			throw new Error('Invalid data');
		}

		this.roomHandler.createRoom(clientId);
		this.roomHandler.updateRoom();
	}

	private handleAddUserToRoom({ data, clientId }: RequestOptions) {
		if (!validateAddUserToRoomData(data)) {
			this.messageManager.sendMessage(clientId, 'Invalid data');
			throw new Error('Invalid data');
		}

		this.roomHandler.addUserToRoom(data, clientId);
		this.roomHandler.updateRoom();
		this.roomHandler.createGame();
	}

	private handleAddShips({ data, clientId }: RequestOptions) {
		if (!validateAddShipsData(data)) {
			this.messageManager.sendMessage(clientId, 'Invalid data');
			throw new Error('Invalid data');
		}

		this.shipsHandler.addShips(data, clientId);
		this.launchHandler.startGame(data);
	}
}
