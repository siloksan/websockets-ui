import { Position, Ship, SHIP_STATUS } from '../types';
import { CELL_STATUS, CellStatus, ShipType } from '../handlers/single-game';

export class ShipsPlacer {
	constructor(
		readonly boardSize: number,
		readonly shipsInPort: ShipType,
		readonly ships: Ship[]
	) {}

	private readonly createEmptyBoard = (boardSize: number) => {
		return Array.from({ length: boardSize }, () => Array.from({ length: boardSize }, () => CELL_STATUS.EMPTY));
	};

	/**
	 * @returns A boolean value where `true` represents one direction (e.g., vertical)
	 * and `false` represents the other direction (e.g., horizontal).
	 */
	readonly getShipDirection = () => Math.random() > 0.5;

	readonly getOccupiedPositions = (firstShipPosition: Position, direction: boolean, shipSize: number, boardSize: number) => {
		const tempOccupiedPositions: Position[] = [];
		if (direction) {
			// vertical direction
			// if ship is in the first column, x will be 0
			let x = firstShipPosition.x === 0 ? firstShipPosition.x : firstShipPosition.x - 1;
			while (x < firstShipPosition.x + 2 && x < boardSize) {
				let y = firstShipPosition.y - 1;
				// write each position include cells around the ship
				while (y < firstShipPosition.y + shipSize + 1 && y < boardSize) {
					tempOccupiedPositions.push({ x, y });
					y += 1;
				}
				x += 1;
			}
		} else {
			// horizontal direction
			// if ship is in the first row, y will be 0
			let y = firstShipPosition.y === 0 ? firstShipPosition.y : firstShipPosition.y - 1;
			while (y < firstShipPosition.y + 2 && y < boardSize) {
				let x = firstShipPosition.x - 1;
				// write each position include cells around the ship
				while (x < firstShipPosition.x + shipSize + 1 && x < boardSize) {
					tempOccupiedPositions.push({ x, y });
					x += 1;
				}
				y += 1;
			}
		}

		return tempOccupiedPositions;
	};

		readonly checkAvailability = (tempOccupiedPositions: Position[], availableCells: Set<string>) => {
		return tempOccupiedPositions.every((position) => availableCells.has(JSON.stringify(position)));
	};

	private readonly placeShipOnBoard = (
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

	public readonly getPlacedShips = (boardSize: number) => {
		const ships: Ship[] = [];
		const board = this.createEmptyBoard(boardSize);
		const availableCells = this.getBoardCells(this.boardSize);

		this.shipsInPort.forEach((ship) => {
			let shipsInDock = ship.count;
			while (shipsInDock > 0) {
				const direction = this.getShipDirection();
				const availableFirstPositionsForShip = this.getAllAvailablePositionsForShip(direction, ship.length, availableCells, boardSize);
				const randomAvailableFirstPosition = this.getRandomAvailablePosition(availableFirstPositionsForShip);
				const occupiedShipsCells = this.getOccupiedPositions(randomAvailableFirstPosition, direction, ship.length, boardSize);
				// delete each ship's occupied position include cells around the ship from availableCells
				occupiedShipsCells.forEach((position) => availableCells.delete(JSON.stringify(position)));

				const shipData: Ship = {
					position: randomAvailableFirstPosition,
					direction,
					length: ship.length,
					type: ship.type,
					damageCells: new Set(),
					status: SHIP_STATUS.UNDAMAGED,
				};

				// save ship in ships array
				ships.push(shipData);

				// TODO: place ship on the board
				this.placeShipOnBoard(randomAvailableFirstPosition, direction, ship.length, board);
				shipsInDock -= 1;
			}
		});

		return ships;
	};

	private getAllAvailablePositionsForShip(direction: boolean, shipSize: number, availableCells: Set<string>, boardSize: number) {
		const availableCellsForShip: Position[] = [];

		// check all available cells and if it suit add to availableCellsForShip
		Array.from(availableCells).forEach((cell) => {
			const cellCoordinate = JSON.parse(cell) as Position;

			const tempOccupiedPositions = this.getOccupiedPositions(cellCoordinate, direction, shipSize, boardSize);

			const isAvailablePosition = this.checkAvailability(tempOccupiedPositions, availableCells);

			if (isAvailablePosition) availableCellsForShip.push(cellCoordinate);
		})

		return availableCellsForShip;
	}

	private getRandomAvailablePosition = (availableFirstPositionsForShip: Position[]) => {
		const randomIndex = Math.floor(Math.random() * availableFirstPositionsForShip.length);
		const position = availableFirstPositionsForShip[randomIndex];

		if (!position) {
			throw new Error('There is not available position for ship');
		}

		return position;
	}

	private getBoardCells(boardSize: number) {
		const boardCells = new Set<string>();
		for (let x = 0; x < boardSize; x += 1 ) {
			for (let y = 0; y < boardSize; y += 1) {
				boardCells.add(JSON.stringify({ x, y }))
			}
		}

		return boardCells;
	}
}
