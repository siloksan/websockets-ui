export const TYPES_OF_MESSAGES = {
	reg: 'reg',
};

export type TypeOfMessage = keyof typeof TYPES_OF_MESSAGES;

interface UserData {
	name: string;
	password: string;
}

interface ErrorData {
	name: string;
	index: number | string;
	error: boolean;
	errorText: string;
}

type Data = UserData | ErrorData;

export interface Message {
	type: TypeOfMessage;
	data: Data;
	id: 0;
}
