import WebSocket from 'ws';
import {
	AddUserToRoomReq,
	CreateGameRes,
	CreateRoomReq,
	RequestData,
	Room,
	TYPES_OF_MESSAGES,
	WebSocketClients,
} from '../types';
import { isNonEmptyString, isNullable, isObject } from '../validators/common';
import { ROOMS, USERS } from '../data-storage';

export class RoomHandler {
	private rooms = ROOMS;
	private readonly users = USERS;
	private readonly wsClients: WebSocketClients;

	constructor(wsClients: WebSocketClients) {
		this.wsClients = wsClients;
	}

	private validateCreateRoomData(data: RequestData): data is CreateRoomReq {
		return !isNonEmptyString(data);
	}

	private validateAddUserToRoomData(data: RequestData): data is AddUserToRoomReq {
		if (!isObject(data)) {
			return false;
		}

		return 'indexRoom' in data;
	}

	public updateRoom = () => {
		this.createGame();
		this.wsClients.forEach((client) => {
			client.send(JSON.stringify({ type: TYPES_OF_MESSAGES.update_room, data: JSON.stringify(this.rooms) }));
		});
	};

	public createRoom(client: WebSocket, data: RequestData, clientId: number) {
		if (!this.validateCreateRoomData(data)) {
			client.send(JSON.stringify({ error: 'Invalid data' }));
		} else {
			const user = this.users.find((user) => user.index === clientId);
			if (isNullable(user)) {
				client.send(JSON.stringify({ error: 'User not found' }));
			} else {
				const room = { roomId: Date.now(), roomUsers: [{ name: user.name, index: clientId }] };
				this.rooms.push(room);
			}
		}
	}

	public addUserToRoom(client: WebSocket, data: RequestData, clientId: number) {
		if (!this.validateAddUserToRoomData(data)) {
			client.send(JSON.stringify({ error: 'Invalid data' }));
		} else {
			const room = this.rooms.find((room) => room.roomId === data.indexRoom);
			const user = this.users.find((user) => user.index === clientId);

			if (isNullable(room) || isNullable(user)) {
				client.send(JSON.stringify({ error: 'Invalid data' }));
			} else if (this.checkUserInRoom(room, clientId)) {
				client.send(JSON.stringify({ error: 'User already in the room!' }));
			} else {
				room.roomUsers.push({ name: user.name, index: clientId });
			}
		}
	}

	private readonly checkUserInRoom = (room: Room, clientId: number) => {
		const currentUser = room.roomUsers.find((user) => user.index === clientId);
		return !isNullable(currentUser);
	};

	private readonly createGame = () => {
		const newRooms = this.rooms.filter((room, idx) => {
			if (room.roomUsers.length === 2) {
				room.roomUsers.forEach((user) => {
					const newGameData: CreateGameRes = {
						idGame: `GameId-${idx}`,
						idPlayer: Number(user.index),
					};

					this.wsClients.get(newGameData.idPlayer)!.send(
						JSON.stringify({
							type: TYPES_OF_MESSAGES.create_game,
							data: JSON.stringify(newGameData),
							id: 0,
						})
					);
				});

				return false;
			} else {
				return true;
			}
		});

		this.rooms = newRooms;
	};
}
