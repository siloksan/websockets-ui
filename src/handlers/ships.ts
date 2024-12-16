import { DataStorage } from '../data-storage';
import { AddShipsReq, ClientId, PlayerShipsData } from '../types';

export class ShipsHandler {
	private readonly ships = DataStorage.getInstance().ships;

	public addShips(data: AddShipsReq, clientId: ClientId) {
		const { gameId } = data;

		const shipsStorage: PlayerShipsData = {
			indexPlayer: clientId,
			ships: data.ships,
			hits: 0,
			shotShips: new Map(),
			shotsStorage: new Set(),
			turn: false,
		};

		const users = this.ships.get(gameId);

		if (users && users.length < 2) {
			users.push(shipsStorage);
		} else {
			shipsStorage.turn = true;
			this.ships.set(gameId, [shipsStorage]);
		}
	}
}
