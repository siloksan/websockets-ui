import { GameShipsStorage, GamesStorage, Users, Rooms } from '../types';

export class DataStorage {
	public readonly rooms: Rooms = new Map();
	public readonly users: Users = new Map();
	public readonly ships: GameShipsStorage = new Map();
	public readonly winners = new Map<string, number>();
	public readonly gamesStorage: GamesStorage = new Map();

	private static instance: DataStorage;

	public static getInstance() {
		if (!DataStorage.instance) {
			DataStorage.instance = new DataStorage();
		}
		return DataStorage.instance;
	}
}
