import { AddUserToRoomReq, ClientId, CreateGameRes, Room, TYPES_OF_MESSAGES } from '../types';
import { isNullable } from '../validators/common';
import { DataStorage } from '../data-storage';
import { MessageManager } from '../message-manager';

export class RoomHandler {
	private readonly users = DataStorage.getInstance().users;
	private rooms = DataStorage.getInstance().rooms;
	private readonly messageManager = MessageManager.getInstance();

	public updateRoom = () => {
		this.messageManager.broadcastMessage(
			JSON.stringify({ type: TYPES_OF_MESSAGES.update_room, data: JSON.stringify(this.rooms), id: 0 })
		);
	};

	public createRoom(clientId: ClientId) {
		const user = this.users.get(clientId);
		if (isNullable(user)) {
			this.messageManager.sendMessage(clientId, JSON.stringify({ error: 'User not found' }));
		} else {
			const room = { roomId: Date.now(), roomUsers: [{ name: user.name, index: user.index }] };
			this.rooms.push(room);
		}
	}

	public addUserToRoom(data: AddUserToRoomReq, clientId: ClientId) {
		const { indexRoom } = data;
		const room = this.rooms.find((room) => room.roomId === indexRoom);
		const user = this.users.get(clientId);

		if (isNullable(room) || isNullable(user)) {
			this.messageManager.sendMessage(clientId, JSON.stringify({ error: 'Invalid data' }));
		} else if (this.checkUserInRoom(room, clientId)) {
			this.messageManager.sendMessage(clientId, JSON.stringify({ error: 'User already in the room!' }));
		} else {
			room.roomUsers.push({ name: user.name, index: clientId });
		}
	}

	private readonly checkUserInRoom = (room: Room, clientId: ClientId) => {
		const currentUser = room.roomUsers.find((user) => user.index === clientId);
		return !isNullable(currentUser);
	};

	public readonly createGame = () => {
		this.rooms = this.rooms.filter((room, idx) => {
			if (room.roomUsers.length === 2) {
				room.roomUsers.forEach((user) => {
					const newGameData: CreateGameRes = {
						idGame: `GameId-${idx}`,
						idPlayer: user.index,
					};

					this.messageManager.sendMessage(
						user.index,
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
	};

	public readonly deleteRoom = (roomId: number) => {
		this.rooms = this.rooms.filter((room) => room.roomId !== roomId);
	};

	public readonly removeUserInRoom = (clientId: ClientId) => {
		this.rooms.some((room) => {
			let userRoomIndex: number | null = null;
			room.roomUsers.some((user, index) => {
				if (user.index === clientId) {
					userRoomIndex = index;
					return true;
				}
				return false;
			});
			if (!isNullable(userRoomIndex)) {
				room.roomUsers = room.roomUsers.filter((_, idx) => userRoomIndex !== idx);
				return true;
			}
		});
	};
}
