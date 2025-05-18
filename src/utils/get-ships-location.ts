import { Ship, SHIP_STATUS } from '../types';

export type ClientShipData = {
	position: { x: number; y: number };
	direction: boolean;
	type: 'huge' | 'large' | 'medium' | 'small';
	length: number;
};

const SHIPS: ClientShipData[][] = [
	[
		{ position: { x: 3, y: 4 }, direction: true, type: 'huge', length: 4 },
		{ position: { x: 6, y: 2 }, direction: false, type: 'large', length: 3 },
		{ position: { x: 7, y: 6 }, direction: true, type: 'large', length: 3 },
		{ position: { x: 2, y: 9 }, direction: false, type: 'medium', length: 2 },
		{ position: { x: 0, y: 3 }, direction: false, type: 'medium', length: 2 },
		{ position: { x: 6, y: 4 }, direction: false, type: 'medium', length: 2 },
		{ position: { x: 3, y: 2 }, direction: false, type: 'small', length: 1 },
		{ position: { x: 4, y: 0 }, direction: true, type: 'small', length: 1 },
		{ position: { x: 0, y: 6 }, direction: false, type: 'small', length: 1 },
		{ position: { x: 1, y: 0 }, direction: true, type: 'small', length: 1 },
	],
	[
		{ position: { x: 0, y: 1 }, direction: false, type: 'huge', length: 4 },
		{ position: { x: 1, y: 7 }, direction: false, type: 'large', length: 3 },
		{ position: { x: 4, y: 4 }, direction: false, type: 'large', length: 3 },
		{ position: { x: 1, y: 3 }, direction: true, type: 'medium', length: 2 },
		{ position: { x: 8, y: 0 }, direction: true, type: 'medium', length: 2 },
		{ position: { x: 6, y: 6 }, direction: false, type: 'medium', length: 2 },
		{ position: { x: 9, y: 3 }, direction: true, type: 'small', length: 1 },
		{ position: { x: 9, y: 7 }, direction: false, type: 'small', length: 1 },
		{ position: { x: 5, y: 0 }, direction: true, type: 'small', length: 1 },
		{ position: { x: 5, y: 2 }, direction: false, type: 'small', length: 1 },
	],
	[
		{ position: { x: 5, y: 5 }, direction: false, type: 'huge', length: 4 },
		{ position: { x: 0, y: 5 }, direction: false, type: 'large', length: 3 },
		{ position: { x: 7, y: 0 }, direction: true, type: 'large', length: 3 },
		{ position: { x: 3, y: 2 }, direction: false, type: 'medium', length: 2 },
		{ position: { x: 4, y: 7 }, direction: true, type: 'medium', length: 2 },
		{ position: { x: 8, y: 7 }, direction: true, type: 'medium', length: 2 },
		{ position: { x: 9, y: 0 }, direction: true, type: 'small', length: 1 },
		{ position: { x: 5, y: 0 }, direction: true, type: 'small', length: 1 },
		{ position: { x: 0, y: 7 }, direction: false, type: 'small', length: 1 },
		{ position: { x: 6, y: 7 }, direction: true, type: 'small', length: 1 },
	],
];

export function getShipsLocation() {
	const randomIndex = Math.floor(Math.random() * SHIPS.length);
	const ships = SHIPS[randomIndex];

	if (!ships) {
		throw new Error('There are no ships');
	}

	return addPropToShips(ships);
}

export function addPropToShips(ships: ClientShipData[]): Ship[] {
	return ships.map((ship) => ({ ...ship, damageCells: new Set(), status: SHIP_STATUS.UNDAMAGED }));
}

export function serializeShipData(ships: Ship[]): ClientShipData[] {
	return ships.map((ship) => ({
		position: ship.position,
		direction: ship.direction,
		type: ship.type,
		length: ship.length,
	}));
}
