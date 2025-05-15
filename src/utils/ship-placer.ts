import { Position, Ship, SHIP_STATUS } from '../types';
import { CELL_STATUS, CellStatus, ShipsInPort, ShipType } from '../handlers/single-game';

export class ShipsPlacer {
	constructor(
		readonly boardSize: number,
		readonly shipsInPort: ShipType,
		readonly ships: Ship[]
	) {}

	readonly #createEmptyBoard = (boardSize: number) => {
		return Array.from({ length: boardSize }, () => Array.from({ length: boardSize }, () => CELL_STATUS.EMPTY));
	};

	readonly #getRandomPositionForShip = (shipSize: ShipsInPort['length']) => {
		return {
			x: Math.floor(Math.random() * (this.boardSize - shipSize)),
			y: Math.floor(Math.random() * (this.boardSize - shipSize)),
		};
	};

	/**
	 * @returns A boolean value where `true` represents one direction (e.g., vertical)
	 * and `false` represents the other direction (e.g., horizontal).
	 */
	readonly #getShipDirection = () => Math.random() > 0.5;

	readonly #getOccupiedPositions = (firstShipPosition: Position, direction: boolean, shipSize: number) => {
		const tempOccupiedPositions: Position[] = [];
		if (direction) {
			// vertical direction
			// if ship is in the first column, x will be 0
			let x = firstShipPosition.x === 0 ? firstShipPosition.x : firstShipPosition.x - 1;
			while (x < firstShipPosition.x + 2 && x < this.boardSize) {
				let y = firstShipPosition.y - 1;
				// write each position include cells around the ship
				while (y < firstShipPosition.y + shipSize + 1 && y < this.boardSize) {
					tempOccupiedPositions.push({ x, y });
					y += 1;
				}
				x += 1;
			}
		} else {
			// horizontal direction
			// if ship is in the first row, y will be 0
			let y = firstShipPosition.y === 0 ? firstShipPosition.y : firstShipPosition.y - 1;
			while (y < firstShipPosition.y + 2 && y < this.boardSize) {
				let x = firstShipPosition.x - 1;
				// write each position include cells around the ship
				while (x < firstShipPosition.x + shipSize + 1 && x < this.boardSize) {
					tempOccupiedPositions.push({ x, y });
					x += 1;
				}
				y += 1;
			}
		}

		return tempOccupiedPositions;
	};

	readonly #checkAvailability = (tempOccupiedPositions: Position[], occupiedPositions: Set<string>) => {
		return !tempOccupiedPositions.some((position) => occupiedPositions.has(JSON.stringify(position)));
	};

	readonly #placeShipOnBoard = (
		firstShipPosition: Position,
		direction: boolean,
		shipSize: number,
		board: CellStatus[][]
	) => {
		let occupiedPlace = 0;
		while (occupiedPlace < shipSize) {
			if (direction) {
				// vertical direction
				const row = board[firstShipPosition.y + occupiedPlace];
				if (row) row[firstShipPosition.x] = CELL_STATUS.SHIP;
			} else {
				// horizontal direction
				const row = board[firstShipPosition.y];
				if (row) {
					row[firstShipPosition.x + occupiedPlace] = CELL_STATUS.SHIP;
				}
			}

			occupiedPlace += 1;
		}
	};

	public readonly autoPlaceShips = () => {
		const occupiedPositions: Set<string> = new Set();
		const ownBoard = this.#createEmptyBoard(this.boardSize);

		this.shipsInPort.forEach((ship) => {
			let shipsInDock = ship.count;
			while (shipsInDock > 0) {
				let firstShipPosition = this.#getRandomPositionForShip(ship.length);
				let direction = this.#getShipDirection();
				let tempOccupiedPositions = this.#getOccupiedPositions(firstShipPosition, direction, ship.length);
				let isAvailable = this.#checkAvailability(tempOccupiedPositions, occupiedPositions);
				// check if the ship can be placed generate new position and direction
				while (!isAvailable) {
					firstShipPosition = this.#getRandomPositionForShip(ship.length);
					direction = this.#getShipDirection();
					tempOccupiedPositions = this.#getOccupiedPositions(firstShipPosition, direction, ship.length);
					isAvailable = this.#checkAvailability(tempOccupiedPositions, occupiedPositions);
				}

				// write each position include cells around the ship in the set
				tempOccupiedPositions.forEach((position) => occupiedPositions.add(JSON.stringify(position)));
				const shipData: Ship = {
					position: firstShipPosition,
					direction,
					length: ship.length,
					type: ship.type,
					damageCells: new Set(),
					status: SHIP_STATUS.UNDAMAGED,
				};
				// save ship in ships array
				this.ships.push(shipData);

				// TODO: place ship on the board
				this.#placeShipOnBoard(firstShipPosition, direction, ship.length, ownBoard);

				shipsInDock -= 1;
			}
		});
		console.log('this.ships: ', this.ships);
		console.table(ownBoard);
	};

	private getAllAvailablePositionsForShip(direction: true, shipSize: number, occupiedPositions: Set<string>) {}
}
