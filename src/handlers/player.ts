import { Message, TYPES_OF_MESSAGES } from '../types';
import { AbstractHandler } from './abstract';

export class PlayerHandler extends AbstractHandler {
	validate(message: Message): boolean {
		const { data, type } = message;
		console.log('data: ', data);
		if (type !== TYPES_OF_MESSAGES.reg) {
			return false;
		}
		// const { name, password } = data;
		return true;
	}

	protected execute(client: import('ws'), data: Message): void {
		client.send(JSON.stringify({ type: 're', data: data.data }));
	}
}
