import { isNullable } from '../validators/common';
import { TYPES_OF_MESSAGES, UserDataRes, UserDataReq, ClientId, RegisteredUser } from '../types';
import { DataStorage } from '../data-storage';
import { MessageManager } from '../message-manager';

export class PlayerHandler {
	private readonly users = DataStorage.getInstance().users;
	private readonly messageManager = MessageManager.getInstance();
	private readonly usersIDs: Map<string, ClientId> = new Map();

	public createUser(data: UserDataReq, clientId: ClientId): void {
		let userId: ClientId | '' = '';
		let error = false;
		let errorText = '';
		let existedUserData: RegisteredUser | undefined;
		const { name, password } = data;

		// if user already exist we need to get his id
		const oldUserIndex = this.usersIDs.get(name);

		// if user doesn't exist we need to create new
		if (isNullable(oldUserIndex)) {
			userId = clientId;
			this.usersIDs.set(data.name, clientId);
			this.users.set(userId, { ...data, index: userId });
		}

		// if user exist we need to get his data
		if (!isNullable(oldUserIndex)) {
			existedUserData = this.users.get(oldUserIndex);
		}

		// if user exist we need to check password
		if (!isNullable(existedUserData) && existedUserData.password === password) {
			userId = clientId;
			this.usersIDs.set(existedUserData.name, userId);
			this.users.set(userId, { ...data, index: userId });
		}

		// if user doesn't exist or password is wrong we need to send error
		if (userId === '') {
			error = true;
			errorText = 'Wrong password';
		}

		const response: UserDataRes = { error, errorText, name, index: userId };
		this.messageManager.sendMessage(
			clientId,
			JSON.stringify({ type: TYPES_OF_MESSAGES.reg, data: JSON.stringify(response) })
		);
	}
}
