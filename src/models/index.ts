import { UserDataReq } from '../types';

export class Users {
	private users: UserDataReq[] = [];

	addUser(data: UserDataReq) {
		this.users.push(data);
	}

	name: string;
	password: string;
}
