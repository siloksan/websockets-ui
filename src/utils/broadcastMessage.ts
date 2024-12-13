import WebSocket from 'ws';
import { WebSocketClients } from '../types';

export function broadcastMessage(ws: WebSocket, clients: WebSocketClients, clientId: number, message: string) {
	clients.forEach((client, id) => {
		if (client.readyState === WebSocket.OPEN && id === clientId) {
			ws.send(message);
		}
	});
}
