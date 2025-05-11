import { AddUserToRoomReq, ID, CreateGameRes, TYPES_OF_MESSAGES } from '../types';
import { isNullable } from '../validators/common';
import { DataStorage } from '../data-storage';
import { MessageManager } from '../message-manager';
import { randomUUID } from 'node:crypto';

export class RoomHandler {
	private readonly users = DataStorage.getInstance().users;
	private readonly rooms = DataStorage.getInstance().rooms;
	private readonly messageManager = MessageManager.getInstance();

	public updateRoom = () => {
		const rooms = [...this.rooms.values()];

		const serializedRooms = rooms.map(({ roomId, roomUsers }) => {
			return { roomId, roomUsers: roomUsers.map((user) => ({ name: user.name, id: user.uuid })) };
		});

		this.messageManager.broadcastMessage(
			JSON.stringify({ type: TYPES_OF_MESSAGES.update_room, data: JSON.stringify(serializedRooms), id: 0 })
		);
	};

	public createRoom(clientId: ID) {
		const user = this.users.get(clientId);
		if (isNullable(user)) {
			throw new Error('User not found');
		}

		if (user.roomId) {
			throw new Error('User already create room');
		}
		user.roomId = randomUUID();
		const room = { roomId: user.roomId, roomUsers: [user] };
		this.rooms.set(room.roomId, room);
	}

	public addUserToRoom(data: AddUserToRoomReq, clientId: ID) {
		const { indexRoom } = data;
		const room = this.rooms.get(indexRoom);
		const user = this.users.get(clientId);
		console.log('user: ', user);

		if (isNullable(room) || isNullable(user)) {
			throw new Error('Room or user not found');
		} else if (user.roomId) {
			throw new Error('User already in the room!');
		}

		user.roomId = indexRoom;
		room.roomUsers.push(user);
	}

	public readonly createGame = (clientId: ID) => {
		const user = this.users.get(clientId);
		if (isNullable(user)) {
			throw new Error('User not found');
		}

		if (user.roomId === null) {
			throw new Error('User not in room');
		}

		const room = this.rooms.get(user.roomId);
		if (isNullable(room)) {
			throw new Error('Room not found');
		}

		room.roomUsers.forEach((user) => {
			const gameData: CreateGameRes = {
				idGame: randomUUID(),
				idPlayer: user.uuid,
			};

			user.roomId = null;

			this.messageManager.sendMessage(
				user.uuid,
				JSON.stringify({
					type: TYPES_OF_MESSAGES.create_game,
					data: JSON.stringify(gameData),
					id: 0,
				})
			);
		});

		this.rooms.delete(room.roomId);
	};

	public readonly removeUserInRoom = (clientId: ID) => {
		const user = this.users.get(clientId);
		if (isNullable(user)) {
			throw new Error('User not found');
		}

		if (user.roomId === null) {
			throw new Error('User not in room');
		}

		this.rooms.delete(user.roomId);
	};
}
