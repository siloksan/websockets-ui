import { ClientId, RequestData, TypeOfMessage, TYPES_OF_MESSAGES } from '../types';
import { PlayerHandler } from './player';
import {
	validateAddShipsData,
	validateAddUserToRoomData,
	validateAttackData,
	validateCreateRoomData,
	validateRandomAttackData,
	validateUserData,
} from '../validators/request';
import { MessageManager } from '../message-manager';
import { RoomHandler } from './room';
import { ShipsHandler } from './ships';
import { LaunchHandler } from './launch';
import { AttackHandler } from './attack';
import { TurnHandler } from './turn';

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
		private readonly launchHandler: LaunchHandler,
		private readonly attackHandler: AttackHandler,
		private readonly turnHandler: TurnHandler
	) {
		this.handlers = new Map([
			[TYPES_OF_MESSAGES.reg, this.handleRegister.bind(this)],
			[TYPES_OF_MESSAGES.disconnect, this.handleDisconnect.bind(this)],
			[TYPES_OF_MESSAGES.create_room, this.handleCreateRoom.bind(this)],
			[TYPES_OF_MESSAGES.add_user_to_room, this.handleAddUserToRoom.bind(this)],
			[TYPES_OF_MESSAGES.add_ships, this.handleAddShips.bind(this)],
			[TYPES_OF_MESSAGES.attack, this.handleAttack.bind(this)],
			[TYPES_OF_MESSAGES.randomAttack, this.handleRandomAttack.bind(this)],
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

		this.messageManager.broadcastMessage(JSON.stringify(data));
		this.shipsHandler.addShips(data, clientId);
		this.launchHandler.startGame(data);
		this.turnHandler.sendTurnMessage(data.gameId);
	}

	private handleAttack({ data, clientId }: RequestOptions) {
		if (!validateAttackData(data)) {
			this.messageManager.sendMessage(clientId, 'Invalid data');
			throw new Error('Invalid data');
		}

		this.attackHandler.attack(data);
	}

	private handleRandomAttack({ data, clientId }: RequestOptions) {
		if (!validateRandomAttackData(data)) {
			this.messageManager.sendMessage(clientId, 'Invalid data');
			throw new Error('Invalid data');
		}

		this.attackHandler.randomAttack(data);
	}
}
