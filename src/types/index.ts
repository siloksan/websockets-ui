export const TYPES_OF_MESSAGES = {
	reg: 'reg',
};

export type TypeOfMessage = keyof typeof TYPES_OF_MESSAGES;

export interface Message {
	type: TypeOfMessage;
	id: 0;
}

export interface UserMessage extends Message {
	data: {
		name: string;
		password: string;
	};
}

interface ErrorData {
	name: string;
	index: number | string;
	error: boolean;
	errorText: string;
}

type Data = UserData | ErrorData;
