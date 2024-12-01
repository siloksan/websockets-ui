import WebSocket from 'ws';
import { Room, TYPES_OF_MESSAGES } from '../types';

class RoomHandler {
	private readonly rooms: Room[] = [];

	validate() {
		// if (!isObject(data)) {
		// 	return false;
		// }

		// if (!('password' in data) || !('name' in data)) {
		// 	return false;
		// }

		// if (isNullable(data.name) || isNullable(data.password)) {
		// 	return false;
		// }

		// if (!isNonEmptyString(data.name) || !isNonEmptyString(data.password)) {
		// 	return false;
		// }

		return true;
	}

	public updateRoom(client: WebSocket) {
		const roomsStringify = this.rooms.map((room: Room) => {
			const { roomId, users } = room;
			const usersStringify = users.map((user) => JSON.stringify(user));
			return JSON.stringify({ roomId, users: usersStringify });
		});

		client.send(JSON.stringify({ type: TYPES_OF_MESSAGES.update_room, data: JSON.stringify(roomsStringify) }));
	}

	// public createRoom(data: string) {}
}

export const roomHandler = new RoomHandler();
