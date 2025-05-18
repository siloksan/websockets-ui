import { ID, TypeOfMessage } from '../types';

interface ClientResponse {
	type: TypeOfMessage;
	data: {
		name: string;
		index: number | string;
		error: boolean;
		errorText: string;
	};
}

export class ClientError extends Error {
	constructor(
		readonly clientResponse: ClientResponse,
		readonly clientId: ID
	) {
		const message = JSON.stringify({
			type: clientResponse.type,
			data: JSON.stringify(clientResponse.data),
		});
		super(message);
	}
}
