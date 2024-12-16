import { AddShipsReq, FinishGame, GameStartRes, PlayerShipsData, ShipsStorage, TYPES_OF_MESSAGES } from '../types';
import { isNullable } from '../validators/common';
import { MessageManager } from '../message-manager';
import { DataStorage } from '../data-storage';

export class LaunchHandler {
	private readonly shipsCellsNumber = 20;
	private readonly messageManager = MessageManager.getInstance();
	private readonly ships = DataStorage.getInstance().ships;
	private readonly users = DataStorage.getInstance().users;
	private readonly winners = DataStorage.getInstance().winners;

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

	public finishGame(gameData: PlayerShipsData[]) {
		const winner = this.getWinner(gameData);

		if (isNullable(winner)) {
			return;
		}

		const winnerData = this.users.get(winner.indexPlayer);

		if (isNullable(winnerData)) {
			throw new Error('Winner not found');
		}

		const wins = this.winners.get(winnerData.name);
		const newWins = isNullable(wins) ? 1 : wins + 1;

		this.winners.set(winnerData.name, newWins);

		gameData.forEach((player) => {
			const data: FinishGame = {
				winPlayer: winnerData.index,
			};

			const response = {
				type: TYPES_OF_MESSAGES.finish,
				data: JSON.stringify(data),
				id: 0,
			};

			this.messageManager.sendMessage(player.indexPlayer, JSON.stringify(response));
		});

		this.updateWinners();
	}

	private getWinner(gameData: PlayerShipsData[]) {
		const [player1, player2] = gameData;

		if (isNullable(player1) || isNullable(player2)) {
			throw new Error('Players not found');
		}

		if (player1.hits === this.shipsCellsNumber) {
			return player2;
		} else if (player2.hits === this.shipsCellsNumber) {
			return player1;
		}

		return null;
	}

	public updateWinners() {
		const winners = Array.from(this.winners.entries()).map(([name, wins]) => ({ name, wins }));

		const response = {
			type: TYPES_OF_MESSAGES.update_winners,
			data: JSON.stringify(winners),
			id: 0,
		};

		this.messageManager.broadcastMessage(JSON.stringify(response));
	}
}
