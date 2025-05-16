// import { ShipsPlacer } from '../utils/ship-placer';
import { ShipsPlacer } from '../utils/ship-placer';
import { Ship, SHIPS_TYPES } from '../types';

export const SHIPS_IN_PORT = [
	{ type: SHIPS_TYPES.huge, length: 4, count: 1 },
	{ type: SHIPS_TYPES.large, length: 3, count: 2 },
	{ type: SHIPS_TYPES.medium, length: 2, count: 3 },
	{ type: SHIPS_TYPES.small, length: 1, count: 4 },
] as const;

export type ShipType = typeof SHIPS_IN_PORT;

export type ShipsInPort = (typeof SHIPS_IN_PORT)[number];

// const BOARD_SIZE = 10;

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
	// ownBoard: CellStatus[][];
	// opponentBoard: CellStatus[][];
	turn: boolean; // true - bot, false - player
	// shotsStorage: Set<string>;
}

export class SingleGameHandler {
	// readonly #gameState: BotState;
	// readonly #shipsPlacer: ShipsPlacer;

	constructor() {
		const shipPlacer = new ShipsPlacer(SHIPS_IN_PORT);

		shipPlacer.getPlacedShips(10)
		// this.#gameState = {
		// 	ships: [],
		// 	activeShips: 0,
		// 	// ownBoard: [],
		// 	// opponentBoard: this.#createEmptyBoard(BOARD_SIZE),
		// 	turn: false,
		// 	// shotsStorage: new Set(),
		// };

		// this.#shipsPlacer = new ShipsPlacer(BOARD_SIZE, SHIPS_IN_PORT, this.#gameState.ships);
	}

	public readonly placeBotShips = () => {
		// this.#shipsPlacer.autoPlaceShips();
	};
}
