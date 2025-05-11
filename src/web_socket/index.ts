import { logger, ClientError } from '../utils';
import { randomUUID } from 'node:crypto';
import WebSocket, { WebSocketServer } from 'ws';
import { BaseGameHandler } from '../handlers/base-game-handler';
import { PlayerHandler } from '../handlers/player';
import { MessageManager } from '../message-manager';
import { TYPES_OF_MESSAGES } from '../types';
import { RoomHandler } from '../handlers/room';
import { handleMessage } from '../utils/parse-message';
import { ShipsHandler } from '../handlers/ships';
import { LaunchHandler } from '../handlers/launch';
import { AttackHandler } from '../handlers/attack';
import { TurnHandler } from '../handlers/turn';

const turnHandler = new TurnHandler();
const launchHandler = new LaunchHandler();

export const baseGameHandler = new BaseGameHandler(
	new PlayerHandler(),
	new RoomHandler(),
	new ShipsHandler(),
	new LaunchHandler(),
	new AttackHandler(turnHandler, launchHandler),
	turnHandler
);

export function startWebSocketServer(port: number) {
	const wsServer = new WebSocketServer({ port });
	logger(`WebSocket server started on the ${port} port!`);
	wsServer.on('connection', (ws) => {
		const clientId = randomUUID();
		logger(`WebSocket client with id: ${clientId} connected!`);

		const messageManager = MessageManager.getInstance();

		messageManager.registerClient(clientId, ws);

		ws.on('message', (message) => {
			try {
				handleMessage(message, clientId, baseGameHandler);
			} catch (error) {
				handleWSError(ws, messageManager, error);
			}
		});

		ws.on('close', () => {
			console.log(`WebSocket client with id: ${clientId} disconnected!`);
			try {
				baseGameHandler.handlers.get(TYPES_OF_MESSAGES.disconnect)?.({ clientId });
			} catch (error) {
				handleWSError(ws, messageManager, error);
			}
		});

		ws.on('error', function error(err) {
			console.error('WebSocket Error:', err);
			try {
				baseGameHandler.handlers.get(TYPES_OF_MESSAGES.disconnect)?.({ clientId });
			} catch (error) {
				console.error(error);
			}
		});
	});
}

function handleWSError(ws: WebSocket, messageManager: MessageManager, error: unknown) {
	if (error instanceof ClientError) {
		logger(error.message);
		messageManager.sendMessage(error.clientId, error.message);
	} else if (error instanceof Error) {
		logger(error.message);
		ws.send(error.message);
	} else {
		logger(JSON.stringify(error));
		ws.send(JSON.stringify(error));
	}
}
