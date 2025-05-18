import { passwordReplace } from '../utils/password-replace';
import { ID } from '../types';
import WebSocket from 'ws';

export class MessageManager {
	private readonly clients: Map<ID, WebSocket>;
	private static instance: MessageManager;
	constructor() {
		this.clients = new Map();
	}

	public static getInstance(): MessageManager {
		if (!this.instance) {
			this.instance = new MessageManager();
		}
		return this.instance;
	}

	registerClient(clientId: ID, client: WebSocket) {
		this.clients.set(clientId, client);
	}

	unregisterClient(clientId: ID) {
		this.clients.delete(clientId);
	}

	sendMessage(clientId: ID, message: string) {
		const client = this.clients.get(clientId);
		if (client) {
			console.log(`Send message to client with clientId - ${clientId} :`, passwordReplace(message));
			client.send(message);
		} else {
			throw new Error(`Client with clientId - ${clientId} not found`);
		}
	}

	broadcastMessage(message: string) {
		this.clients.forEach((client) => {
			client.send(message);
		});
	}
}
