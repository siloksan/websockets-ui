import { DataStorage } from '../data-storage';
import { AddShipsReq, ID, PlayerShipsData } from '../types';

export class ShipsHandler {
	private readonly storage = DataStorage.getInstance();

	public addShips(data: AddShipsReq, clientId: ID) {
		const { gameId } = data;
		const shipsStorage: PlayerShipsData = {
			indexPlayer: clientId,
			ships: data.ships,
			hits: 0,
			shotShips: new Map(),
			shotsStorage: new Set(),
			turn: false,
		};

		const users = this.storage.ships.get(gameId);

		if (users && users.length < 2) {
			users.push(shipsStorage);
		} else {
			shipsStorage.turn = true;
			this.storage.ships.set(gameId, [shipsStorage]);
		}
	}
}
