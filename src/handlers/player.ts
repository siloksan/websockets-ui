import { isNullable } from '../validators/common';
import { UserData, ID } from '../types';
import { DataStorage } from '../data-storage';
import { ClientError } from '../utils';
import { randomUUID } from 'node:crypto';

interface UserDto {
	name: string;
	password: string;
}
export class PlayerHandler {
	private readonly users = DataStorage.getInstance().users;

	public handleUserInput(userDto: UserDto, clientId: ID): UserData | undefined {
		const userData = this.#getUserByName(userDto.name);

		if (isNullable(userData)) {
			return this.#registerUser(userDto, clientId);
		} else {
			return this.#loginUser(userDto, userData, clientId);
		}
	}

	#registerUser(userDto: UserDto, clientId: ID) {
		const userData: UserData = {
			uuid: randomUUID(),
			clientId,
			...userDto,
		};
		this.users.set(userData.uuid, userData);

		return this.users.get(userData.uuid);
	}

	#loginUser(userDto: UserDto, userData: UserData, clientId: ID) {
		if (userDto.password !== userData.password) {
			throw new ClientError(
				{ type: 'reg', data: { name: '', error: true, errorText: 'Wrong credentials', index: clientId } },
				clientId
			);
		}

		if (userData.clientId) {
			throw new ClientError(
				{ type: 'reg', data: { name: '', error: true, errorText: 'User already logged in', index: clientId } },
				clientId
			);
		}

		userData.clientId = clientId;

		return userData;
	}

	#getUserByName(name: string): UserData | undefined {
		const user = this.users.entries().find(([, user]) => {
			return user.name === name;
		});

		return user?.[1];
	}

	public handleLogout(clientId: ID) {
		const user = this.users.get(clientId);
		if (user) {
			user.clientId = null;
		}
	}
}
