import { Position, Ship, SHIP_STATUS } from '../types';
import { CELL_STATUS, CellStatus, ShipType } from '../handlers/single-game';

export class ShipsPlacer {
	constructor(
		readonly shipsInPort: ShipType,
	) {}

	private readonly createEmptyBoard = (boardSize: number) => {
		return Array.from({ length: boardSize }, () => Array.from({ length: boardSize }, () => CELL_STATUS.EMPTY));
	};

	/**
	 * @returns A boolean value where `true` represents one direction (e.g., vertical)
	 * and `false` represents the other direction (e.g., horizontal).
	 */
	readonly getShipDirection = () => Math.random() > 0.5;

	readonly getOccupiedPositions = (firstShipPosition: Position, direction: boolean, shipSize: number) => {
		const tempOccupiedPositions: Position[] = [];

		// write each position include cells around the ship
		if (!direction) {
			// vertical direction
			for (let x = firstShipPosition.x - 1; x <= firstShipPosition.x + 1; x += 1) {
				for (let y = firstShipPosition.y - 1; y <= firstShipPosition.y + shipSize + 1; y += 1) {
					if (x > 0 && y > 0) {
					tempOccupiedPositions.push({ x, y })
					}
				}
			}
		} else {
			// horizontal direction
			for (let y = firstShipPosition.y - 1; y <= firstShipPosition.y + 1; y += 1) {
				for (let x = firstShipPosition.x - 1; y <= firstShipPosition.x + shipSize + 1; x += 1) {
					if (x > 0 && y > 0) {
						tempOccupiedPositions.push({ x, y })
					}				}
			}
		}

		return tempOccupiedPositions;
	};

		readonly checkAvailability = (firstShipPosition: Position, direction: boolean, shipSize: number, availableCells: Set<string>) => {
		if (!direction) {
		// vertical direction
			for (let x = firstShipPosition.x - 1; x <= firstShipPosition.x + 1; x += 1) {
				for (let y = firstShipPosition.y - 1; y <= firstShipPosition.y + shipSize + 1; y += 1) {
					
				}
			}
		} else {
			// horizontal direction
			for (let y = firstShipPosition.y - 1; y <= firstShipPosition.y + 1; y += 1) {
				for (let x = firstShipPosition.x - 1; y <= firstShipPosition.x + shipSize + 1; x += 1) {
					if (x > 0 && y > 0) {
						tempOccupiedPositions.push({ x, y })
					}				}
			}
		}
	};

	private readonly checkCellAvailability = (cell: Position, availableCells: Set<string>) => {
		
	}

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
		const availableCells = this.getBoardCells(boardSize);

		this.shipsInPort.forEach((ship) => {
			let shipsInDock = ship.count;
			while (shipsInDock > 0) {
				const direction = this.getShipDirection();
				const availableFirstPositionsForShip = this.getAllAvailablePositionsForShip(direction, ship.length, availableCells);
				const randomAvailableFirstPosition = this.getRandomAvailablePosition(availableFirstPositionsForShip);
				const occupiedShipsCells = this.getOccupiedPositions(randomAvailableFirstPosition, direction, ship.length);
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

		console.table(board)
		return ships;
	};

	private getAllAvailablePositionsForShip(direction: boolean, shipSize: number, availableCells: Set<string>) {
		// const availableCellsForShip: Position[] = [];

		// check all available cells and if it suit add to availableCellsForShip
		const availableCellsForShip: Position[] = Array.from(availableCells).forEach((cell) => {
			const cellCoordinate = JSON.parse(cell) as Position;

			const tempOccupiedPositions = this.getOccupiedPositions(cellCoordinate, direction, shipSize);

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
