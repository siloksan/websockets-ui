import { isNonEmptyString, isNullable, isObject } from '../validators';
import { TYPES_OF_MESSAGES, UserDataRes, RequestData, UserDataReq } from '../types';
import WebSocket from 'ws';
import { logger } from '../utils';

class PlayerHandler {
	private readonly players: UserDataReq[] = [];
	validate(data: RequestData): data is UserDataReq {
		if (!isObject(data)) {
			return false;
		}

		if (!('password' in data) || !('name' in data)) {
			return false;
		}

		if (isNullable(data.name) || isNullable(data.password)) {
			return false;
		}

		if (!isNonEmptyString(data.name) || !isNonEmptyString(data.password)) {
			return false;
		}

		return true;
	}

	public createUser(client: WebSocket, data: RequestData): void {
		if (!this.validate(data)) {
			client.send(JSON.stringify({ error: 'Invalid data' }));
			return;
		}

		const { name } = data;
		try {
			const response = this.addUser(data);

			client.send(JSON.stringify({ type: TYPES_OF_MESSAGES.reg, data: JSON.stringify(response) }));
		} catch (error) {
			if (error instanceof Error) {
				logger(error.message);

				const response: UserDataRes = { error: true, errorText: error.message, name, index: '' };

				client.send(JSON.stringify({ type: TYPES_OF_MESSAGES.reg, data: JSON.stringify(response) }));
			}
		}
	}

	private addUser(data: UserDataReq) {
		if (this.players.some((player) => player.name === data.name)) {
			throw new Error('User already exists');
		}

		const { name } = data;
		const index = new Date().getTime();
		const response = { error: false, errorText: '', name, index };
		this.players.push(data);
		return response;
	}
}

export const playerHandler = new PlayerHandler();
