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
	attack: 'attack',
	turn: 'turn',
	randomAttack: 'randomAttack',
	finish: 'finish',
} as const;

export type TypeOfMessage = keyof typeof TYPES_OF_MESSAGES;

export const SHIPS_TYPES = {
	small: 'small',
	medium: 'medium',
	large: 'large',
	huge: 'huge',
} as const;

type ShipType = keyof typeof SHIPS_TYPES;

export const ATTACK_STATUS = {
	miss: 'miss',
	killed: 'killed',
	shot: 'shot',
} as const;

export type AttackType = keyof typeof ATTACK_STATUS;

// ClientId === UserId
export type ClientId = `ClientId-${number}`;
export type GameId = `GameId-${number}`;

export type GameShipsStorage = Map<GameId, PlayerShipsData[]>;
export type RegisteredUsers = Map<ClientId, RegisteredUser>;

export type RequestData =
	| UserDataReq
	| CreateRoomReq
	| AddUserToRoomReq
	| AddShipsReq
	| AttackReq
	| RandomAttackDataReq
	| undefined;

export type ResponseData = UserDataRes | CreateGameRes | TurnRes | UpdateUserWinsResData | FinishGame;

export interface RequestMessage {
	type: TypeOfMessage;
	data: RequestData;
	id: 0;
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

export interface Position {
	x: number;
	y: number;
}

export interface Ship {
	position: Position;
	direction: boolean;
	length: number;
	type: ShipType;
}

export interface ShipsStorage {
	indexPlayer: ClientId;
	ships: Ship[];
}

export interface GameStartRes {
	currentPlayerIndex: ClientId;
	ships: Ship[];
}

// request types
export interface AttackReq extends Position {
	gameId: GameId;
	indexPlayer: ClientId;
}

export interface AddShipsReq {
	gameId: GameId;
	ships: Ship[];
	indexPlayer: ClientId;
}

export interface AddUserToRoomReq {
	indexRoom: number;
}

export interface UserDataReq {
	name: string;
	password: string;
}

export interface RandomAttackDataReq {
	gameId: GameId;
	indexPlayer: ClientId;
}

// response types
export interface ResponseMessage {
	type: TypeOfMessage;
	data: ResponseData;
	id: 0;
}

export interface AttackRes {
	position: Position;
	currentPlayer: ClientId;
	status: AttackType;
}

export interface TurnRes {
	currentPlayer: ClientId;
}

export type UpdateUserWinsResData = UserWins[];

export interface FinishGame {
	winPlayer: ClientId;
}

// common types
export interface NumberRange {
	min: number;
	max: number;
}

export interface ShotShips {
	hitPositions: Position[];
}

export type ShotsStorage = Set<string>;

export interface PlayerShipsData extends ShipsStorage {
	shotShips: Map<number, ShotShips>;
	hits: number;
	shotsStorage: ShotsStorage;
	turn: boolean;
}

export interface UserWins {
	user: string;
	wins: number;
}
