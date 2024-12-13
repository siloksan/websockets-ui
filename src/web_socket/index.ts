import { logger } from '../utils';
import { WebSocketServer } from 'ws';
import { BaseGameHandler } from '../handlers/BaseGameHandler';
import { PlayerHandler } from '../handlers/player';
import { MessageManager } from '../message-manager';
import { ClientId } from '../types';

export const handlers = new BaseGameHandler(new PlayerHandler());

export function startWebSocketServer(port: number = 8181) {
	const wsServer = new WebSocketServer({ port });
	logger(`WebSocket server started on the ${port} port!`);
	wsServer.on('connection', (ws) => {
		const clientId: ClientId = `ClientId-${Date.now()}`;
		logger(`WebSocket client with id: ${clientId} connected!`);

		const messageManager = MessageManager.getInstance();

		messageManager.registerClient(clientId, ws);

		ws.on('message', (message) => {
			try {
				handlers.handleMessage(message, clientId);
			} catch (error) {
				if (error instanceof Error) {
					logger(error.message);
					ws.send(error.message);
				} else {
					logger(JSON.stringify(error));
					ws.send(JSON.stringify(error));
				}
			}
			ws.on('close', function close() {
				console.log('Client disconnected');
			});

			ws.on('error', function error(err) {
				console.error('WebSocket Error:', err);
			});
		});
	});
}
