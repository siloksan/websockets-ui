import { isNullable } from '../validators/common';
import { TYPES_OF_MESSAGES, UserDataRes, UserDataReq, ClientId, UserId } from '../types';
import { DataStorage } from '../data-storage';
import { MessageManager } from '../message-manager';

export class PlayerHandler {
	private readonly users = DataStorage.getInstance().users;
	private readonly messageManager = MessageManager.getInstance();

	public createUser(data: UserDataReq, clientId: ClientId): void {
		let userId: UserId | '' = '';
		let error = false;
		let errorText = '';
		const { name, password } = data;
		const user = this.users.get(data.name);

		if (isNullable(user)) {
			userId = `UserId-${this.users.size}`;
			this.users.set(name, { ...data, index: userId });
		} else if (user.password === password) {
			userId = user.index;
		} else {
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
