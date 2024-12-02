import { UserDataReq } from '../types';

export class Users {
	private users: UserDataReq[] = [];

	addUser(data: UserDataReq) {
		this.users.push(data);
	}

	name: string;
	password: string;
}

export class Clients {
	private clients: number[] = [];

	public createClient(clientId: number) {
		this.clients.push(clientId);
	}

	public removeClient(clientId: number) {
		this.clients = this.clients.filter((client) => client !== clientId);
	}

	public getClients() {
		return this.clients;
	}

	public getClientById(clientId: number) {
		return this.clients.find((client) => client === clientId);
	}
}
