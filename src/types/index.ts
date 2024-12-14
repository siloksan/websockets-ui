import WebSocket from 'ws';

export const TYPES_OF_MESSAGES = {
	reg: 'reg',
	disconnect: 'disconnect',
	update_room: 'update_room',
	update_winners: 'update_winners',
	create_room: 'create_room',
	add_user_to_room: 'add_user_to_room',
	create_game: 'create_game',
	add_ships: 'add_ships',
	start_game: 'start_game',
} as const;

// ClientId === UserId
export type ClientId = `ClientId-${number}`;
export type GameId = `GameId-${number}`;

export type GameShipsStorage = Map<GameId, ShipsStorage[]>;
export type RegisteredUsers = Map<ClientId, RegisteredUser>;

export type RequestData = UserDataReq | CreateRoomReq | AddUserToRoomReq | AddShipsReq | undefined;
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

export interface RegisteredUser extends UserDataReq {
	index: ClientId;
}

export type CreateRoomReq = '';

export interface UserDataRes {
	name: string;
	index: ClientId | '';
	error: boolean;
	errorText: string;
}

export interface AddUserToRoomReq {
	indexRoom: number;
}

export interface RoomUser {
	name: string;
	index: ClientId;
}

export interface Room {
	roomId: number;
	roomUsers: RoomUser[];
}

export interface Winner {
	name: string;
	wins: number;
}

export interface CreateGameRes {
	idGame: GameId;
	idPlayer: ClientId;
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
	indexPlayer: ClientId;
}

export interface ShipsStorage {
	indexPlayer: ClientId;
	ships: Ship[];
}

export interface GameStartRes {
	currentPlayerIndex: ClientId;
	ships: Ship[];
}

export interface ResponseMessage {
	type: TypeOfMessage;
	data: ResponseData;
	id: 0;
}
