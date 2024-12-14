import { DataStorage } from '../data-storage';
import { AddShipsReq, ClientId, ShipsStorage } from '../types';

export class ShipsHandler {
	private readonly ships = DataStorage.getInstance().ships;

	public addShips(data: AddShipsReq, clientId: ClientId) {
		const { gameId } = data;

		const shipsStorage: ShipsStorage = {
			indexPlayer: clientId,
			ships: data.ships,
		};

		const users = this.ships.get(gameId);

		if (users && users.length < 2) {
			users.push(shipsStorage);
		} else {
			this.ships.set(gameId, [shipsStorage]);
		}
	}
}
