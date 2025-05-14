import { Room, GameShipsStorage, RegisteredUsers, GamesStorage } from '../types';

export class DataStorage {
	public readonly rooms: Room[] = [];
	public readonly users: RegisteredUsers = new Map();
	public readonly ships: GameShipsStorage = new Map();
	public readonly winners = new Map<string, number>();
	public readonly gamesStorge: GamesStorage = new Map();

	private static instance: DataStorage;

	public static getInstance() {
		if (!DataStorage.instance) {
			DataStorage.instance = new DataStorage();
		}
		return DataStorage.instance;
	}
}
