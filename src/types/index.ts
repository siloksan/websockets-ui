export const TYPES_OF_MESSAGES = {
	reg: 'reg',
	update_room: 'update_room',
	update_winners: 'update_winners',
};

export type RequestData = UserDataReq | CreateRoomReq;
export type ResponseData = UserDataRes;

export type TypeOfMessage = keyof typeof TYPES_OF_MESSAGES;

export interface RequestMessage {
	type: TypeOfMessage;
	data: RequestData;
	id: 0;
}

export interface UserDataReq {
	name: string;
	password: string;
}

export type CreateRoomReq = '';

export interface UserDataRes {
	name: string;
	index: string | number;
	error: boolean;
	errorText: string;
}

export interface RoomUsers {
	name: string;
	index: string | number;
}

export interface Room {
	roomId: number;
	users: RoomUsers[];
}

export interface Winner {
	name: string;
	wins: number;
}
