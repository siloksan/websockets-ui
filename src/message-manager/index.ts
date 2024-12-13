import { ClientId } from '../types';
import WebSocket from 'ws';

export class MessageManager {
	private readonly clients: Map<ClientId, WebSocket>;
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

	registerClient(clientId: ClientId, client: WebSocket) {
		this.clients.set(clientId, client);
	}

	unregisterClient(clientId: ClientId) {
		this.clients.delete(clientId);
	}

	sendMessage(clientId: ClientId, message: string) {
		const client = this.clients.get(clientId);
		if (client) {
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
