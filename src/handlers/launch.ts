import { AddShipsReq, GameStartRes, ShipsStorage, TYPES_OF_MESSAGES } from '../types';
import { isNullable } from '../validators/common';
import { MessageManager } from '../message-manager';
import { DataStorage } from '../data-storage';

export class LaunchHandler {
	private readonly messageManager = MessageManager.getInstance();
	private readonly ships = DataStorage.getInstance().ships;

	public checkReadinessOfPlayers(currentGame?: ShipsStorage[]) {
		if (isNullable(currentGame)) {
			return false;
		}

		// if both players added their ships
		return currentGame.length === 2;
	}

	public startGame(data: AddShipsReq) {
		const { gameId } = data;

		const currentGame = this.ships.get(gameId);
		const playersIsReady = this.checkReadinessOfPlayers(currentGame);

		if (!playersIsReady || isNullable(currentGame)) return;

		// start games for ready players
		currentGame.forEach((player) => {
			const clientId = player.indexPlayer;
			const response: GameStartRes = {
				currentPlayerIndex: clientId,
				ships: player.ships,
			};

			this.messageManager.sendMessage(
				clientId,
				JSON.stringify({
					type: TYPES_OF_MESSAGES.start_game,
					data: JSON.stringify(response),
					id: 0,
				})
			);
		});

		return currentGame;
	}
}
