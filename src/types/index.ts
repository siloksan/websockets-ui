import WebSocket from 'ws';

export const TYPES_OF_MESSAGES = {
	reg: 'reg',
	update_room: 'update_room',
	update_winners: 'update_winners',
	create_room: 'create_room',
	add_user_to_room: 'add_user_to_room',
	create_game: 'create_game',
	add_ships: 'add_ships',
};

export type ClientId = `ClientId-${number}`;
export type GameId = `GameId-${number}`;
export type UserId = `UserId-${number}`;

export type GameShipsStorage = Map<GameId, ShipsStorage[]>;
export type RegisteredUsers = Map<string, RegisteredUser>;

export interface RegisteredUser extends UserDataReq {
	index: UserId;
}

export type RequestData = UserDataReq | CreateRoomReq | AddUserToRoomReq | AddShipsReq;
export type ResponseData = UserDataRes | CreateGameRes;

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
	index: UserId | '';
	error: boolean;
	errorText: string;
}

export interface AddUserToRoomReq {
	indexRoom: number;
}

export interface RoomUsers {
	name: string;
	index: string | number;
}

export interface Room {
	roomId: number;
	roomUsers: RoomUsers[];
}

export interface Winner {
	name: string;
	wins: number;
}

export interface CreateGameRes {
	idGame: GameId;
	idPlayer: number;
}

export type WebSocketClients = Map<number, WebSocket>;

export interface ShipPosition {
	x: number;
	y: number;
}

export const SHIPS_TYPES = {
	small: 'small',
	medium: 'medium',
	large: 'large',
	huge: 'huge',
} as const;

type ShipType = keyof typeof SHIPS_TYPES;

export interface Ship {
	position: ShipPosition;
	direction: boolean;
	length: number;
	type: ShipType;
}

export interface AddShipsReq {
	gameId: GameId;
	ships: Ship[];
	indexPlayer: number;
}

export interface ShipsStorage {
	indexPlayer: number;
	ships: Ship[];
}

export interface GameStartReq {
	currentPlayerIndex: number;
	ships: Ship[];
}
