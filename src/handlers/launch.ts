import WebSocket from 'ws';
import { GameId, GameShipsStorage, GameStartReq, WebSocketClients } from '../types';
import { isNullable } from '../validators/common';
import { MessageManager } from '../message-manager';

export class LaunchHandler {
	private readonly gameShipsStorage: GameShipsStorage;
	private readonly messageManager: MessageManager;
	private readonly wsClients: WebSocketClients;

	constructor(gameShipsStorage: GameShipsStorage, wsClients: WebSocketClients) {
		this.gameShipsStorage = gameShipsStorage;
		this.wsClients = wsClients;
	}

	public checkReadinessOfPlayers(gameId: GameId) {
		const games = this.gameShipsStorage.get(gameId);

		if (isNullable(games)) {
			return false;
		}

		// if both players added their ships
		return games.length === 2;
	}

	public startGame(client: WebSocket, clientId: number) {
		const gameShipsStorage = this.gameShipsStorage.get(clientId);
		if (gameShipsStorage && gameShipsStorage.length === 2) {
			const response: GameStartReq = {};
			console.log('response: ', response);
		}
	}
}
