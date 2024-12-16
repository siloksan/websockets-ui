import { logger } from '../utils';
import { WebSocketServer } from 'ws';
import { BaseGameHandler } from '../handlers/BaseGameHandler';
import { PlayerHandler } from '../handlers/player';
import { MessageManager } from '../message-manager';
import { ClientId, TYPES_OF_MESSAGES } from '../types';
import { RoomHandler } from '../handlers/room';
import { handleMessage } from '../utils/parse-message';
import { ShipsHandler } from '../handlers/ships';
import { LaunchHandler } from '../handlers/launch';
import { AttackHandler } from '../handlers/attack';
import { TurnHandler } from '../handlers/turn';

const turnHandler = new TurnHandler();

export const baseGameHandler = new BaseGameHandler(
	new PlayerHandler(),
	new RoomHandler(),
	new ShipsHandler(),
	new LaunchHandler(),
	new AttackHandler(turnHandler),
	turnHandler
);

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
				handleMessage(message, clientId, baseGameHandler);
			} catch (error) {
				if (error instanceof Error) {
					logger(error.message);
					ws.send(error.message);
				} else {
					logger(JSON.stringify(error));
					ws.send(JSON.stringify(error));
				}
			}
		});

		ws.on('close', () => {
			console.log(`WebSocket client with id: ${clientId} disconnected!`);
			const disconnectHandler = baseGameHandler.handlers.get(TYPES_OF_MESSAGES.disconnect);
			if (disconnectHandler) {
				disconnectHandler({ clientId });
			}
		});

		ws.on('error', function error(err) {
			console.error('WebSocket Error:', err);
		});
	});
}
