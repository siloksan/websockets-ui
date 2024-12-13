import { isNonEmptyString, isObject } from '../validators/common';
import { AddShipsReq, GameShipsStorage, RequestData, Ship, SHIPS_TYPES, ShipsStorage } from '../types';
import WebSocket from 'ws';

export class ShipsHandler {
	private readonly gameShipsStorage: GameShipsStorage;

	constructor(gameShipsStorage: GameShipsStorage) {
		this.gameShipsStorage = gameShipsStorage;
	}

	private validateAddShipsData(data: RequestData): data is AddShipsReq {
		if (!isObject(data)) {
			return false;
		}

		if (!('type' in data)) {
			return false;
		}

		if (!isNonEmptyString(data.type)) {
			return false;
		}

		if (!(data.type in SHIPS_TYPES)) {
			return false;
		}

		if (!('ships' in data)) {
			return false;
		}

		if (!Array.isArray(data.ships)) {
			return false;
		}

		const shipsValid = data.ships.every((ship) => this.validateShipData(ship));

		if (!shipsValid) {
			return false;
		}

		if (!('indexPlayer' in data)) {
			return false;
		}

		return true;
	}

	private validateShipData(ship: unknown): ship is Ship {
		if (!isObject(ship)) {
			return false;
		}

		if (!('type' in ship)) {
			return false;
		}

		if (!isNonEmptyString(ship.type)) {
			return false;
		}

		if (!(ship.type in SHIPS_TYPES)) {
			return false;
		}

		if (!('position' in ship)) {
			return false;
		}

		if (!isObject(ship.position)) {
			return false;
		}

		return true;
	}

	public addShips(client: WebSocket, data: RequestData, clientId: number) {
		if (!this.validateAddShipsData(data)) {
			console.log('data: ', data);
			client.send(JSON.stringify({ error: 'Invalid data' }));
			return;
		}
		const { gameId } = data;

		const shipsStorage: ShipsStorage = {
			indexPlayer: clientId,
			ships: data.ships,
		};

		const users = this.gameShipsStorage.get(gameId);

		if (users && users.length < 2) {
			users.push(shipsStorage);
		}

		this.gameShipsStorage.set(gameId, [shipsStorage]);
	}
}
