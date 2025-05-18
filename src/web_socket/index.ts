import { ClientError } from '../utils';
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
import { SingleGameHandler } from '../handlers/single-game';
import { BotHandler } from '../handlers/bot-handler';

const messageManager = MessageManager.getInstance();
const playerHandler = new PlayerHandler();
const turnHandler = new TurnHandler();
const launchHandler = new LaunchHandler();
const shipsHandler = new ShipsHandler();
const roomHandler = new RoomHandler();
const attackHandler = new AttackHandler(turnHandler, launchHandler);
const botHandler = new BotHandler();
const singleGameHandler = new SingleGameHandler(botHandler);

export const baseGameHandler = new BaseGameHandler(
	playerHandler,
	roomHandler,
	shipsHandler,
	launchHandler,
	attackHandler,
	turnHandler,
	singleGameHandler
);

export function startWebSocketServer(port: number) {
	const wsServer = new WebSocketServer({ port });
	console.log(`WebSocket server started on the ${port} port!`);
	wsServer.on('connection', (ws) => {
		const clientId = randomUUID();
		console.log(`WebSocket client with id: ${clientId} connected!`);

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
		console.log(error.message);
		messageManager.sendMessage(error.clientId, error.message);
	} else if (error instanceof Error) {
		console.log(error.message);
		ws.send(error.message);
	} else {
		console.log(JSON.stringify(error));
		ws.send(JSON.stringify(error));
	}
}
