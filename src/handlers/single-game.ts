import { DataStorage } from '../data-storage';
import {
	AddShipsReq,
	AttackReq,
	BotData,
	CreateGameRes,
	FinishGame,
	GameStartRes,
	ID,
	PlayerData,
	Ship,
	SHIPS_TYPES,
	SingleGameData,
	TurnRes,
	TYPES_OF_MESSAGES,
} from '../types';
import { randomUUID } from 'node:crypto';
import { MessageManager } from '../message-manager';
import { isNullable } from '../validators/common';
import { addPropToShips, getShipsLocation, serializeShipData } from '../utils/get-ships-location';
import { BotHandler } from './bot-handler';

export const SHIPS_IN_PORT = [
	{ type: SHIPS_TYPES.huge, length: 4, count: 1 },
	{ type: SHIPS_TYPES.large, length: 3, count: 2 },
	{ type: SHIPS_TYPES.medium, length: 2, count: 3 },
	{ type: SHIPS_TYPES.small, length: 1, count: 4 },
] as const;

export type ShipType = typeof SHIPS_IN_PORT;

export type ShipsInPort = (typeof SHIPS_IN_PORT)[number];

export const BOARD_SIZE = 10;

export const CELL_STATUS = {
	EMPTY: 0,
	UNAVAILABLE: 1, //cell was shot
	SHIP: 2,
	SHOT: 3,
	KILLED: 4,
} as const;

export type CellStatus = (typeof CELL_STATUS)[keyof typeof CELL_STATUS];

export interface BotState {
	ships: Ship[];
	activeShips: number;
	turn: boolean; // true - bot, false - player
}

export class SingleGameHandler {
	private readonly storage = DataStorage.getInstance();
	private readonly messageManager = MessageManager.getInstance();

	constructor(private readonly botHandler: BotHandler) {}

	public runSingleGame(clientId: ID) {
		this.createGame(clientId);
	}

	private readonly createGame = (clientId: ID) => {
		const user = this.storage.users.get(clientId);
		if (isNullable(user)) {
			throw new Error('User not found');
		}

		const gameId = randomUUID();
		const gameData: CreateGameRes = {
			idGame: gameId,
			idPlayer: user.uuid,
		};

		this.storage.games.set(gameId, 'single');

		this.messageManager.sendMessage(
			user.uuid,
			JSON.stringify({
				type: TYPES_OF_MESSAGES.create_game,
				data: JSON.stringify(gameData),
				id: 0,
			})
		);
	};

	public readonly startGame = (data: AddShipsReq, clientId: ID) => {
		const gameData = this.getPlayersData(data, clientId);
		this.storage.singleGames.set(gameData.gameId, gameData);
		this.sendStartGameMessage(gameData);
		this.sendTurnMessage(gameData);
	};

	private readonly getPlayersData = (data: AddShipsReq, clientId: ID) => {
		const { gameId } = data;
		const notKilled = SHIPS_IN_PORT.reduce((acc, ship) => acc + ship.count, 0);

		const playerData: PlayerData = {
			playerId: clientId,
			ships: addPropToShips(data.ships),
			turn: true,
			notKilled: notKilled,
			damagedShipsStorage: new Map(),
			detectedOpponentsCells: new Set(),
			availableCells: this.getAvailableCells(BOARD_SIZE),
		};

		const botData: BotData = {
			playerId: randomUUID(),
			ships: getShipsLocation(),
			turn: false,
			notKilled: notKilled,
			damagedShipsStorage: new Map(),
			detectedOpponentsCells: new Set(),
			availableCells: this.getAvailableCells(BOARD_SIZE),
			botState: {
				currentDirectionOfAttack: null,
				isOpponentShipDamaged: false,
				lastShot: null,
				maxLengthNotKilledShip: SHIPS_IN_PORT[0].length,
			},
		};

		return {
			gameId,
			player: playerData,
			botData,
		};
	};

	private readonly sendStartGameMessage = (gameData: SingleGameData) => {
		const response: GameStartRes = {
			currentPlayerIndex: gameData.player.playerId,
			ships: serializeShipData(gameData.player.ships),
		};

		this.messageManager.sendMessage(
			gameData.player.playerId,
			JSON.stringify({
				type: TYPES_OF_MESSAGES.start_game,
				data: JSON.stringify(response),
				id: 0,
			})
		);
	};

	private readonly sendTurnMessage = (gameData: SingleGameData) => {
		const data: TurnRes = {
			currentPlayer: gameData.player.playerId,
		};
		const response = {
			type: TYPES_OF_MESSAGES.turn,
			data: JSON.stringify(data),
			id: 0,
		};

		this.messageManager.sendMessage(
			gameData.player.playerId,
			JSON.stringify({
				type: TYPES_OF_MESSAGES.turn,
				data: JSON.stringify(response),
				id: 0,
			})
		);
	};

	public readonly attackRequestHandler = (data: AttackReq) => {
		const gameData = this.storage.singleGames.get(data.gameId);

		if (isNullable(gameData)) {
			throw new Error('Game not found');
		}

		const response = this.botHandler.getAttackResponse(data, gameData);
		response?.forEach((message) => {
			this.messageManager.sendMessage(data.indexPlayer, JSON.stringify(message));
		});

		while (gameData.botData.turn) {
			const response = this.botHandler.botAttack(gameData);
			response?.forEach((message) => {
				this.messageManager.sendMessage(data.indexPlayer, JSON.stringify(message));
			});
		}

		if (this.getLooser(gameData)) {
			this.finishGame(gameData);
			this.updateWinners(gameData);
		}
	};

	private getAvailableCells(boardSize: number) {
		const boardCells = new Set<string>();
		for (let x = 0; x < boardSize; x += 1) {
			for (let y = 0; y < boardSize; y += 1) {
				boardCells.add(JSON.stringify({ x, y }));
			}
		}

		return boardCells;
	}

	private getLooser(gameData: SingleGameData) {
		let looser: PlayerData | BotData | null = null;

		if (gameData.player.notKilled === 0) {
			looser = gameData.player;
		} else if (gameData.botData.notKilled === 0) {
			looser = gameData.botData;
		}

		return looser;
	}

	private finishGame(gameData: SingleGameData) {
		const winner = gameData.player.notKilled === 0 ? gameData.player : gameData.botData;

		const data: FinishGame = {
			winPlayer: winner.playerId,
		};

		const response = {
			type: TYPES_OF_MESSAGES.finish,
			data: JSON.stringify(data),
			id: 0,
		};

		this.messageManager.sendMessage(gameData.player.playerId, JSON.stringify(response));
	}

	private updateWinners(gameData: SingleGameData) {
		const winnerData = gameData.botData.notKilled === 0 && gameData.player;

		if (!winnerData) {
			return;
		}
		const player = this.storage.users.get(winnerData.playerId);

		if (!player) {
			throw new Error('Winner with a such id not found');
		}
		const amountOfWins = this.storage.winners.get(player.name);

		if (!amountOfWins) {
			this.storage.winners.set(player.name, 1);
		} else {
			this.storage.winners.set(player.name, amountOfWins + 1);
		}

		const winners = Array.from(this.storage.winners.entries()).map(([name, wins]) => ({ name, wins }));

		const response = {
			type: TYPES_OF_MESSAGES.update_winners,
			data: JSON.stringify(winners),
			id: 0,
		};

		this.messageManager.broadcastMessage(JSON.stringify(response));
	}
}
