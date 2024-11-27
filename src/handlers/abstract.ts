import { Message } from '../types';
import WebSocket from 'ws';

export abstract class AbstractHandler<T extends Message> {
	handle(client: WebSocket, message: Buffer<ArrayBufferLike>) {
		const response = this.parseMessage(message);
		if (!this.validate(response)) {
			client.send(JSON.stringify({ error: 'Invalid data' }));
			return;
		}
		this.execute(client, response);
	}

	protected parseMessage(message: Buffer<ArrayBufferLike>): T {
		const messageString = message.toString('utf-8');
		return JSON.parse(messageString);
	}

	protected abstract validate(response: T): boolean;

	protected abstract execute(client: WebSocket, response: T): void;
}
