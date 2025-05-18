import { Position } from '../types';

const DIRECTIONS = {
	LEFT: 'LEFT',
	RIGHT: 'RIGHT',
	UP: 'UP',
	DOWN: 'DOWN',
} as const;

export type DirectionType = keyof typeof DIRECTIONS;

type OccupiedPositions = Set<string>;

interface BotState {
	isOpponensShipDamaged: boolean;
	maxLenghtLivingShips: number;
	currentDirrectionOfAttack: DirectionType | null;
	lastShot: Position | null;
}

// if botState.isOpponensShipDamaged === true and  bootState.currentDirrectionOfAttack === null, call this function

export function getShotCoordinatesOnDamagedShip(
	positionHit: Position,
	occupiedPosition: OccupiedPositions,
	botState: BotState
) {
	let nextBestShoot: Position | null = null;
	let isImPossibleShot = false;

	const arrayDirrections = Object.values(DIRECTIONS);
	for (const element of arrayDirrections) {
		const direction = element as DirectionType;
		let shift = 1;
		const quantity = direction === DIRECTIONS.LEFT || direction === DIRECTIONS.UP ? -1 : 1;
		let nextCoordinateX = positionHit.x;
		let nextCoordinateY = positionHit.y;

		while (shift < botState.maxLenghtLivingShips && !isImPossibleShot) {
			if (direction === DIRECTIONS.LEFT || direction === DIRECTIONS.RIGHT) {
				nextCoordinateX = positionHit.x + shift * quantity;
			} else {
				nextCoordinateY = positionHit.y + shift * quantity;
			}

			const nextPosition = { x: nextCoordinateX, y: nextCoordinateY };

			if (shift === 1) {
				nextBestShoot = nextPosition;
			}

			isImPossibleShot = occupiedPosition.has(JSON.stringify(nextPosition));
			shift += 1;
		}

		if (isImPossibleShot) continue;
	}

	return nextBestShoot;
}

export function getRandomPosition(boardSize: number, occupiedPosition: OccupiedPositions) {
	let position: Position;

	do {
		position = {
			x: Math.floor(Math.random() * boardSize),
			y: Math.floor(Math.random() * boardSize),
		};
	} while (occupiedPosition.has(JSON.stringify(position)));

	return position;
}

// if botState.currentDirrectionOfAttack !== null, call this function
export function getShotCoordinatesOnDamagedShipWithKnownDirrection(lastShot: Position, direction: DirectionType) {
	const quantity = direction === DIRECTIONS.LEFT || direction === DIRECTIONS.UP ? -1 : 1;
	let nextCoordinateX = lastShot.x;
	let nextCoordinateY = lastShot.y;

	if (direction === DIRECTIONS.LEFT || direction === DIRECTIONS.RIGHT) {
		nextCoordinateX = lastShot.x + quantity;
	} else {
		nextCoordinateY = lastShot.y + quantity;
	}

	return { x: nextCoordinateX, y: nextCoordinateY };
}
