import {
	ATTACK_STATUS,
	AttackReq,
	AttackType,
	ClientId,
	GameId,
	PlayerShipsData,
	Position,
	RandomAttackDataReq,
	Ship,
	ShotShips,
	TYPES_OF_MESSAGES,
} from '../types';
import { MessageManager } from '../message-manager';
import { DataStorage } from '../data-storage';
import { isInRange, isNullable } from '../validators/common';
import { TurnHandler } from './turn';
import { LaunchHandler } from './launch';

type ShotResult = [AttackType, Ship] | [AttackType];

interface PositionStatus extends Position {
	status: AttackType;
}

export class AttackHandler {
	private readonly messageManager = MessageManager.getInstance();
	private readonly ships = DataStorage.getInstance().ships;

	constructor(
		private readonly turnHandler: TurnHandler,

		private readonly launchHandler: LaunchHandler
	) {}

	public attack(data: AttackReq) {
		const { gameId, indexPlayer, x, y } = data;
		const shot: Position = { x, y };
		const shotStringify = JSON.stringify(shot);
		const currentGame = this.getCurrentGameData(gameId);
		const oppositePlayerData = this.getOpponent(currentGame, indexPlayer);

		// check that player shot in his turn
		if (oppositePlayerData.turn) return;

		// check that shot was not already made
		if (this.checkAlreadyShot(shotStringify, oppositePlayerData)) {
			this.turnHandler.reverseTurn(currentGame);
			this.turnHandler.sendTurnMessage(gameId);
			return;
		}

		// add shot to shotsStorage
		oppositePlayerData.shotsStorage.add(shotStringify);

		const [shotStatus, ship] = this.checkHit(shot, oppositePlayerData);

		// add cells around ships if it killed
		if (shotStatus === ATTACK_STATUS.killed && !isNullable(ship)) {
			this.addAroundShipCellsInShotsStorage(currentGame, oppositePlayerData, ship, shot, indexPlayer);
		}

		// define who shot next
		if (shotStatus === ATTACK_STATUS.miss || shotStatus === ATTACK_STATUS.killed) {
			this.turnHandler.reverseTurn(currentGame);
		}

		currentGame.forEach((player) => {
			const data = {
				position: shot,
				currentPlayer: indexPlayer,
				status: shotStatus,
			};

			const response = {
				type: TYPES_OF_MESSAGES.attack,
				data: JSON.stringify(data),
				id: 0,
			};

			this.messageManager.sendMessage(player.indexPlayer, JSON.stringify(response));
		});

		//after each attack send message about whose next turn
		this.turnHandler.sendTurnMessage(gameId);
		this.launchHandler.finishGame(currentGame);
	}

	public randomAttack(data: RandomAttackDataReq) {
		const { gameId, indexPlayer } = data;
		const currentGame = this.getCurrentGameData(gameId);
		const oppositePlayerData = this.getOpponent(currentGame, indexPlayer);
		const shot = this.getRandomShot(oppositePlayerData);

		if (isNullable(shot)) {
			throw new Error('Cannot find shot!');
		}

		oppositePlayerData.shotsStorage.add(JSON.stringify(shot));

		const [shotStatus, ship] = this.checkHit(shot, oppositePlayerData);

		// add cells around ships if it killed
		if (shotStatus === ATTACK_STATUS.killed && !isNullable(ship)) {
			this.addAroundShipCellsInShotsStorage(currentGame, oppositePlayerData, ship, shot, indexPlayer);
		}

		// define who shot next
		if (shotStatus === ATTACK_STATUS.miss || shotStatus === ATTACK_STATUS.killed) {
			this.turnHandler.reverseTurn(currentGame);
		}

		currentGame.forEach((player) => {
			const data = {
				position: shot,
				currentPlayer: indexPlayer,
				status: shotStatus,
			};
			const response = {
				type: TYPES_OF_MESSAGES.attack,
				data: JSON.stringify(data),
				id: 0,
			};

			this.messageManager.sendMessage(player.indexPlayer, JSON.stringify(response));
		});

		//after each attack send message about whose next turn
		this.turnHandler.sendTurnMessage(gameId);
		this.launchHandler.finishGame(currentGame);
	}

	private getCurrentGameData(gameId: GameId) {
		const currentGame = this.ships.get(gameId);

		if (isNullable(currentGame)) {
			throw new Error(`Game with id ${gameId} not found`);
		}
		return currentGame;
	}

	private getOpponent(currentGame: PlayerShipsData[], clientId: ClientId) {
		const oppositePlayer = currentGame.filter((player) => player.indexPlayer !== clientId)[0];

		if (isNullable(oppositePlayer)) {
			throw new Error('Opposite player not found');
		}

		return oppositePlayer;
	}

	private checkHit(hit: Position, opponentShips: PlayerShipsData): ShotResult {
		for (let i = 0; i < opponentShips.ships.length; i += 1) {
			const ship = opponentShips.ships[i] as Ship;
			let xMatch = false;
			let yMatch = false;

			if (ship.direction) {
				xMatch = ship.position.x === hit.x;
			} else {
				const xRange = { min: ship.position.x, max: ship.position.x + ship.length - 1 };
				xMatch = isInRange(hit.x, xRange);
			}

			if (ship.direction) {
				const yRange = { min: ship.position.y, max: ship.position.y + ship.length - 1 };
				yMatch = isInRange(hit.y, yRange);
			} else {
				yMatch = ship.position.y === hit.y;
			}

			if (xMatch && yMatch) {
				// write in storage hit for the ship
				this.writeHit(hit, opponentShips, i);
				// return shot status and ship index
				const shotResult: ShotResult = [this.getShipStatus(opponentShips, i), ship];
				return shotResult;
			}
		}

		return [ATTACK_STATUS.miss];
	}

	private writeHit(hit: Position, opponentShips: PlayerShipsData, shipIndex: number) {
		opponentShips.hits += 1;
		const shotShips = opponentShips.shotShips.get(shipIndex);

		if (shotShips) {
			shotShips.hitPositions.push(hit);
		} else {
			opponentShips.shotShips.set(shipIndex, { hitPositions: [hit] });
		}
	}

	private getShipStatus(opponentShips: PlayerShipsData, shipIndex: number) {
		// use assertions the same check was in the previous function
		const ship = opponentShips.ships[shipIndex] as Ship;
		const shotShips = opponentShips.shotShips.get(shipIndex) as ShotShips;

		if (shotShips.hitPositions.length === ship.length) {
			return ATTACK_STATUS.killed;
		} else {
			return ATTACK_STATUS.shot;
		}
	}

	private checkAlreadyShot(shotStringify: string, opponentShips: PlayerShipsData) {
		return opponentShips.shotsStorage.has(shotStringify);
	}

	private getRandomShot(opponentShips: PlayerShipsData) {
		const fieldSize = 10;
		let x = 0;
		let y = 0;

		while (x < fieldSize && y < fieldSize) {
			const shot = { x, y };
			if (!this.checkAlreadyShot(JSON.stringify(shot), opponentShips)) {
				return shot;
			}

			// move to the next column
			x += 1;

			// move to the next row
			if (x === fieldSize) {
				x = 0;
				y += 1;
			}
		}
	}

	private addAroundShipCellsInShotsStorage(
		gamesStorage: PlayerShipsData[],
		opponentStorage: PlayerShipsData,
		ship: Ship,
		shot: Position,
		indexPlayer: ClientId
	) {
		const surroundedShipCells = new Set<string>();
		const { x: startX, y: startY } = ship.position;
		let cellStatus: AttackType = ATTACK_STATUS.miss;

		for (let i = -1; i < ship.length + 1; i++) {
			if (!ship.direction) {
				// horizontal direction
				for (let j = -1; j <= 1; j += 1) {
					const x = startX + i;
					const y = startY + j;

					// change status to shot if the cell is in the ship
					if (startY === y && isInRange(x, { min: startX, max: startX + ship.length - 1 })) {
						cellStatus = ATTACK_STATUS.shot;
					}

					// change status to killed if the cell is shot
					if (x === shot.x && y === shot.y) {
						cellStatus = ATTACK_STATUS.killed;
					}

					this.addCellsToSet(surroundedShipCells, { x, y, status: cellStatus });
					cellStatus = ATTACK_STATUS.miss;
				}
			} else {
				// vertical direction
				for (let j = -1; j <= 1; j += 1) {
					const x = startX + j;
					const y = startY + i;

					// change status to shot if the cell is in the ship
					if (startX === x && isInRange(y, { min: startY, max: startY + ship.length - 1 })) {
						cellStatus = ATTACK_STATUS.shot;
					}

					// change status to killed if the cell is shot
					if (x === shot.x && y === shot.y) {
						cellStatus = ATTACK_STATUS.killed;
					}

					this.addCellsToSet(surroundedShipCells, { x, y, status: cellStatus });
					cellStatus = ATTACK_STATUS.miss;
				}
			}
		}

		this.sendMessagesAroundCells(surroundedShipCells, opponentStorage, gamesStorage, indexPlayer);
	}

	private addCellsToSet(cellsSet: Set<string>, shipPosition: PositionStatus) {
		const { x, y } = shipPosition;

		if (x >= 0 && x < 10 && y >= 0 && y < 10) {
			cellsSet.add(JSON.stringify(shipPosition));
		}
	}

	private sendMessagesAroundCells(
		surroundedShipCells: Set<string>,
		opponentStorage: PlayerShipsData,
		gamesStorage: PlayerShipsData[],
		indexPlayer: ClientId
	) {
		surroundedShipCells.forEach((cell) => {
			const parsedCell: PositionStatus = JSON.parse(cell);

			const cellPosition = { x: parsedCell.x, y: parsedCell.y };

			if (!this.checkAlreadyShot(JSON.stringify(cellPosition), opponentStorage)) {
				opponentStorage.shotsStorage.add(JSON.stringify(cellPosition));

				gamesStorage.forEach((player) => {
					const data = {
						position: cellPosition,
						currentPlayer: indexPlayer,
						status: parsedCell.status,
					};

					const response = {
						type: TYPES_OF_MESSAGES.attack,
						data: JSON.stringify(data),
						id: 0,
					};

					this.messageManager.sendMessage(player.indexPlayer, JSON.stringify(response));
				});
			}
		});
	}
}
