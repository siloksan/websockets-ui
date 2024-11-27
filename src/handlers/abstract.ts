import { Message } from '../types';
import WebSocket from 'ws';

export abstract class AbstractHandler {
	handle(client: WebSocket, message: Buffer<ArrayBufferLike>) {
		const data = this.parseMessage(message);
		if (!this.validate(data)) {
			client.send(JSON.stringify({ error: 'Invalid data' }));
			return;
		}
		this.execute(client, data);
	}

	protected parseMessage(message: Buffer<ArrayBufferLike>): Message {
		const messageString = message.toString('utf-8');
		return JSON.parse(messageString);
	}

	protected abstract validate(data: Message): boolean;

	protected abstract execute(client: WebSocket, data: Message): void;
}
