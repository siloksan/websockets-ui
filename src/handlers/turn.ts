import { isNullable } from '../validators/common';
import { MessageManager } from '../message-manager';
import { GameId, PlayerShipsData, TurnRes, TYPES_OF_MESSAGES } from '../types';
import { DataStorage } from '../data-storage';

export class TurnHandler {
	private readonly messageManager = MessageManager.getInstance();
	private readonly gamesStorage = DataStorage.getInstance().ships;

	public sendTurnMessage(gameId: GameId) {
		const currentGame = this.gamesStorage.get(gameId);

		if (isNullable(currentGame) || currentGame.length < 2) {
			return;
		}

		const nextPlayer = currentGame.find((player) => player.turn);

		if (isNullable(nextPlayer)) {
			throw new Error('Next player not found');
		}

		currentGame.forEach((player) => {
			const data: TurnRes = {
				currentPlayer: nextPlayer.indexPlayer,
			};

			const response = {
				type: TYPES_OF_MESSAGES.turn,
				data: JSON.stringify(data),
				id: 0,
			};

			this.messageManager.sendMessage(player.indexPlayer, JSON.stringify(response));
		});
	}

	public reverseTurn(currentGame: PlayerShipsData[]) {
		currentGame.forEach((player) => {
			player.turn = !player.turn;
		});
	}
}
