import { isInRange } from '../validators/common';
import {
	ATTACK_STATUS,
	AttackReq,
	// BotData,
	DetectedCells,
	Position,
	Ship,
	SHIP_STATUS,
	SingleGameData,
	TYPES_OF_MESSAGES,
} from '../types';

// const DIRECTIONS = {
// 	LEFT: 'LEFT',
// 	RIGHT: 'RIGHT',
// 	UP: 'UP',
// 	DOWN: 'DOWN',
// } as const;

export class BotHandler {
	public getAttackResponse = (data: AttackReq, game: SingleGameData) => {
		const { x, y } = data;

		// check that player shot in his turn
		if (!game.player.turn) return;

		const shotCoordinate: Position = { x, y };

		// make sure that the shot has not been fired yet
		if (this.checkPositionAlreadyShoot(shotCoordinate, game.player.detectedOpponentsCells)) return;

		this.addPositionToDetectedCellsStorage(shotCoordinate, game.player.detectedOpponentsCells);
		game.player.availableCells.delete(JSON.stringify(shotCoordinate));

		const damagedShip = this.getDamagedShip(shotCoordinate, game.botData.ships);
		game.botData.turn = false;

		if (!damagedShip) {
			game.botData.turn = true;
			const responseData = {
				position: shotCoordinate,
				currentPlayer: game.player.playerId,
				status: ATTACK_STATUS.miss,
			};

			return [
				{
					type: TYPES_OF_MESSAGES.attack,
					data: JSON.stringify(responseData),
					id: 0,
				},
			];
		}

		this.writeHitToDamagedShipCells(shotCoordinate, damagedShip.damageCells);
		this.updateShipStatus(damagedShip);

		if (damagedShip.status === SHIP_STATUS.KILLED) {
			const killedPositions = this.getShipsKilledPositions(damagedShip);
			const aroundPositions = this.getAroundShipCells(damagedShip);
			aroundPositions.forEach((position) => {
				this.addPositionToDetectedCellsStorage(position, game.botData.detectedOpponentsCells);
			});

			const killedResponse = killedPositions.map((position) => {
				return {
					type: TYPES_OF_MESSAGES.attack,
					data: JSON.stringify({
						position,
						currentPlayer: game.player.playerId,
						status: ATTACK_STATUS.killed,
					}),
					id: 0,
				};
			});

			const aroundResponse = aroundPositions.map((position) => {
				return {
					type: TYPES_OF_MESSAGES.attack,
					data: JSON.stringify({
						position,
						currentPlayer: game.player.playerId,
						status: ATTACK_STATUS.miss,
					}),
					id: 0,
				};
			});

			game.botData.turn = false;

			return [...killedResponse, ...aroundResponse];
		}

		const responseData = {
			position: shotCoordinate,
			currentPlayer: game.player.playerId,
			status: ATTACK_STATUS.shot,
		};

		return [
			{
				type: TYPES_OF_MESSAGES.attack,
				data: JSON.stringify(responseData),
				id: 0,
			},
		];
	};

	private checkPositionAlreadyShoot(shotCoordinate: Position, detectedCells: DetectedCells) {
		return detectedCells.has(JSON.stringify(shotCoordinate));
	}

	private addPositionToDetectedCellsStorage(position: Position, detectedCells: DetectedCells) {
		detectedCells.add(JSON.stringify(position));
	}

	private getDamagedShip(shotCoordinate: Position, playerShips: Ship[]) {
		const damagedShip = playerShips.find((ship) => {
			let xMatch = false;
			let yMatch = false;

			if (ship.direction) {
				const yRange = { min: ship.position.y, max: ship.position.y + ship.length - 1 };
				xMatch = ship.position.x === shotCoordinate.x;
				yMatch = isInRange(shotCoordinate.y, yRange);
			} else {
				const xRange = { min: ship.position.x, max: ship.position.x + ship.length - 1 };
				xMatch = isInRange(shotCoordinate.x, xRange);
				yMatch = ship.position.y === shotCoordinate.y;
			}

			return xMatch && yMatch;
		});

		return damagedShip;
	}

	private writeHitToDamagedShipCells(hitCoordinates: Position, damageCells: Ship['damageCells']) {
		damageCells.add(JSON.stringify(hitCoordinates));
	}

	private updateShipStatus(ship: Ship) {
		if (ship.damageCells.size === 0) {
			ship.status = SHIP_STATUS.UNDAMAGED;
			return;
		}

		if (ship.damageCells.size === ship.length) {
			ship.status = SHIP_STATUS.KILLED;
			return;
		}

		if (ship.damageCells.size > 0) {
			ship.status = SHIP_STATUS.DAMAGED;
		}
	}

	private getShipsKilledPositions(ship: Ship): Position[] {
		return Array.from(ship.damageCells).map((stringCell) => JSON.parse(stringCell));
	}

	private getAroundShipCells(ship: Ship): Position[] {
		const aroundPositions: Position[] = [];

		// write each position include cells around the ship
		if (ship.direction) {
			// vertical direction
			for (let x = ship.position.x - 1; x <= ship.position.x + 1; x += 1) {
				for (let y = ship.position.y - 1; y <= ship.position.y + ship.length; y += 1) {
					const position = { x, y };
					if (x >= 0 && y >= 0 && !ship.damageCells.has(JSON.stringify(position))) {
						aroundPositions.push(position);
					}
				}
			}
		} else {
			// horizontal direction
			for (let y = ship.position.y - 1; y <= ship.position.y + 1; y += 1) {
				for (let x = ship.position.x - 1; x <= ship.position.x + ship.length; x += 1) {
					const position = { x, y };
					if (x >= 0 && y >= 0 && !ship.damageCells.has(JSON.stringify(position))) {
						aroundPositions.push(position);
					}
				}
			}
		}

		return aroundPositions;
	}

	// bot attack
	public botAttack(gameData: SingleGameData) {
		if (gameData.botData.botState.isOpponentShipDamaged && !gameData.botData.botState.currentDirectionOfAttack) {
			// this.getShotCoordinatesOnDamagedShip(gameData.botData);
		}

		const randomShootCoordinate = this.getRandomShotPosition(gameData.player.availableCells);

		return this.getBotAttackResponse(randomShootCoordinate, gameData);
		// const shotCoordinate = this.getRandomShotPosition(availableCells);
		// availableCells.delete(JSON.stringify(shotCoordinate));
		// return shotCoordinate;
	}

	private getRandomShotPosition(availableCells: DetectedCells): Position {
		const randomCellIndex = Math.floor(Math.random() * availableCells.size);
		const randomCell = Array.from(availableCells)[randomCellIndex];
		if (!randomCell) {
			throw new Error('There are no available cells');
		}

		return JSON.parse(randomCell);
	}

	// private getShotCoordinatesOnDamagedShip(
	// 	botData: BotData
	// 	// positionHit: Position,
	// 	// occupiedPosition: OccupiedPositions,
	// 	// botState: BotState
	// ) {
	// 	let nextBestShoot: Position | null = null;
	// 	let isImPossibleShot = false;

	// 	const arrayDirrections = Object.values(DIRECTIONS);
	// 	for (const element of arrayDirrections) {
	// 		const direction = element as DirectionType;
	// 		let shift = 1;
	// 		const quantity = direction === DIRECTIONS.LEFT || direction === DIRECTIONS.UP ? -1 : 1;
	// 		let nextCoordinateX = positionHit.x;
	// 		let nextCoordinateY = positionHit.y;

	// 		while (shift < botState.maxLenghtLivingShips && !isImPossibleShot) {
	// 			if (direction === DIRECTIONS.LEFT || direction === DIRECTIONS.RIGHT) {
	// 				nextCoordinateX = positionHit.x + shift * quantity;
	// 			} else {
	// 				nextCoordinateY = positionHit.y + shift * quantity;
	// 			}

	// 			const nextPosition = { x: nextCoordinateX, y: nextCoordinateY };

	// 			if (shift === 1) {
	// 				nextBestShoot = nextPosition;
	// 			}

	// 			isImPossibleShot = occupiedPosition.has(JSON.stringify(nextPosition));
	// 			shift += 1;
	// 		}

	// 		if (isImPossibleShot) continue;
	// 	}

	// 	return nextBestShoot;
	// }

	public getBotAttackResponse = (shotCoordinate: Position, game: SingleGameData) => {
		this.addPositionToDetectedCellsStorage(shotCoordinate, game.botData.detectedOpponentsCells);
		game.player.availableCells.delete(JSON.stringify(shotCoordinate));

		const damagedShip = this.getDamagedShip(shotCoordinate, game.player.ships);
		game.botData.turn = false;

		if (!damagedShip) {
			const responseData = {
				position: shotCoordinate,
				currentPlayer: game.botData.playerId,
				status: ATTACK_STATUS.miss,
			};

			return [
				{
					type: TYPES_OF_MESSAGES.attack,
					data: JSON.stringify(responseData),
					id: 0,
				},
			];
		}

		this.writeHitToDamagedShipCells(shotCoordinate, damagedShip.damageCells);
		this.updateShipStatus(damagedShip);

		if (damagedShip.status === SHIP_STATUS.KILLED) {
			const killedPositions = this.getShipsKilledPositions(damagedShip);
			const aroundPositions = this.getAroundShipCells(damagedShip);
			aroundPositions.forEach((position) => {
				this.addPositionToDetectedCellsStorage(position, game.botData.detectedOpponentsCells);
			});

			const killedResponse = killedPositions.map((position) => {
				return {
					type: TYPES_OF_MESSAGES.attack,
					data: JSON.stringify({
						position,
						currentPlayer: game.botData.playerId,
						status: ATTACK_STATUS.killed,
					}),
					id: 0,
				};
			});

			const aroundResponse = aroundPositions.map((position) => {
				return {
					type: TYPES_OF_MESSAGES.attack,
					data: JSON.stringify({
						position,
						currentPlayer: game.botData.playerId,
						status: ATTACK_STATUS.miss,
					}),
					id: 0,
				};
			});

			game.botData.turn = true;

			return [...killedResponse, ...aroundResponse];
		}

		const responseData = {
			position: shotCoordinate,
			currentPlayer: game.botData.playerId,
			status: ATTACK_STATUS.shot,
		};

		return [
			{
				type: TYPES_OF_MESSAGES.attack,
				data: JSON.stringify(responseData),
				id: 0,
			},
		];
	};
}
