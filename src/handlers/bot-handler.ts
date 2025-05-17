import { isInRange } from '../validators/common';
import {
	ATTACK_STATUS,
	AttackReq,
	AttackType,
	DetectedCells,
	Position,
	Ship,
	SHIP_STATUS,
	SingleGameData,
	TYPES_OF_MESSAGES,
} from '../types';

export class BotHandler {
	public getAttackResponse = (data: AttackReq, game: SingleGameData) => {
		const { x, y } = data;

		// check that player shot in his turn
		if (!game.player.turn) return;

		const shotCoordinate: Position = { x, y };

		// make sure that the shot has not been fired yet
		if (this.checkPositionAlreadyShoot(shotCoordinate, game.player.detectedOpponentsCells)) return;

		this.addPositionToDetectedCellsStorage(shotCoordinate, game.player.detectedOpponentsCells);

		const damagedShip = this.getDamagedShip(shotCoordinate, game.player.ships);
		let shotStatus: AttackType = ATTACK_STATUS.miss;
		this.writeCellToDetectedOpponentsCell(shotCoordinate, game.player.detectedOpponentsCells);

		if (damagedShip) {
			this.writeHitToDamagedShipCells(shotCoordinate, damagedShip.damageCells);
			this.updateShipStatus(damagedShip);
			shotStatus = this.getShotStatus(damagedShip);
		}

		const responseData = {
			position: shotCoordinate,
			currentPlayer: game.player.playerId,
			status: shotStatus,
		};

		return {
			type: TYPES_OF_MESSAGES.attack,
			data: JSON.stringify(responseData),
			id: 0,
		};
	};

	private checkPositionAlreadyShoot(shotCoordinate: Position, detectedCells: DetectedCells) {
		return detectedCells.has(JSON.stringify(shotCoordinate));
	}

	private addPositionToDetectedCellsStorage(position: Position, detectedCells: DetectedCells) {
		detectedCells.add(JSON.stringify(position));
	}

	private writeCellToDetectedOpponentsCell(shotCoordinate: Position, detectedCells: DetectedCells) {
		detectedCells.add(JSON.stringify(shotCoordinate));
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

	private getShotStatus(ship: Ship) {
		if (ship.status === SHIP_STATUS.KILLED) {
			return ATTACK_STATUS.killed;
		} else {
			return ATTACK_STATUS.shot;
		}
	}
}
