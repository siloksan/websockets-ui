import { isNonEmptyString, isNullable } from '../validators';
import { TYPES_OF_MESSAGES, UserMessage } from '../types';
import { AbstractHandler } from './abstract';
import WebSocket from 'ws';

export class PlayerHandler extends AbstractHandler<UserMessage> {
	validate(response: UserMessage): boolean {
		const { data, type } = response;

		if (type !== TYPES_OF_MESSAGES.reg) {
			return false;
		}

		if (isNullable(data.name) && isNullable(data.password)) {
			return false;
		}

		if (!isNonEmptyString(data.name) && !isNonEmptyString(data.password)) {
			return false;
		}

		return true;
	}

	protected execute(client: WebSocket, response: UserMessage): void {
		client.send(JSON.stringify({ type: TYPES_OF_MESSAGES.reg, data: response.data }));
	}
}
