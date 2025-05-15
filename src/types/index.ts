import { DirectionType } from '../constants';
import WebSocket from 'ws';
import { randomUUID } from 'node:crypto';

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
	single_play: 'single_play',
} as const;

export type TypeOfMessage = keyof typeof TYPES_OF_MESSAGES;

export const ATTACK_STATUS = {
	miss: 'miss',
	killed: 'killed',
	shot: 'shot',
} as const;

export type AttackType = keyof typeof ATTACK_STATUS;

export type ID = ReturnType<typeof randomUUID>;

// uuid === clientId
export interface UserData {
	uuid: ID;
	clientId: ID | null;
	name: string;
	password: string;
	roomId: ID | null;
	gameId: ID | null;
	wins: number;
}

export type GameShipsStorage = Map<ID, PlayerShipsData[]>;
export type Users = Map<ID, UserData>;
export type Rooms = Map<ID, Room>;

export type RequestData =
	| UserData
	| CreateRoomReq
	| AddUserToRoomReq
	| AddShipsReq
	| AttackReq
	| RandomAttackDataReq
	| ''
	| undefined;

export type ResponseData = UserDataRes | CreateGameRes | TurnRes | UpdateUserWinsResData | FinishGame;

export interface RequestMessage {
	type: TypeOfMessage;
	data: RequestData;
	id: 0;
}

export type CreateRoomReq = '';

export interface UserDataRes {
	name: string;
	index: ID | '';
	error: boolean;
	errorText: string;
}

export interface Room {
	roomId: ID;
	roomUsers: UserData[];
}

export interface Winner {
	name: string;
	wins: number;
}

export interface CreateGameRes {
	idGame: ID;
	idPlayer: ID;
}

export type WebSocketClients = Map<number, WebSocket>;

export const SHIPS_TYPES = {
	small: 'small',
	medium: 'medium',
	large: 'large',
	huge: 'huge',
} as const;

type ShipType = keyof typeof SHIPS_TYPES;

export interface Position {
	x: number;
	y: number;
}

export const SHIP_STATUS = {
	UNDAMAGED: 'UNDAMAGED',
	DAMAGED: 'DAMAGED',
	SUNKEN: 'SUNKEN',
} as const;

export type ShipStatus = keyof typeof SHIP_STATUS;

export interface Ship {
	position: Position;
	direction: boolean;
	length: number;
	type: ShipType;
	status: ShipStatus;
	damageCells: Set<string>;
}

export interface ShipsStorage {
	indexPlayer: ID;
	ships: Ship[];
}

export interface GameStartRes {
	currentPlayerIndex: ID;
	ships: Ship[];
}

// request types
export interface AttackReq extends Position {
	gameId: ID;
	indexPlayer: ID;
}

export interface AddShipsReq {
	gameId: ID;
	ships: Ship[];
	indexPlayer: ID;
}

export interface AddUserToRoomReq {
	indexRoom: ID;
}

export interface RandomAttackDataReq {
	gameId: ID;
	indexPlayer: ID;
}

// response types
export interface ResponseMessage {
	type: TypeOfMessage;
	data: ResponseData;
	id: 0;
}

export interface AttackRes {
	position: Position;
	currentPlayer: ID;
	status: AttackType;
}

export interface TurnRes {
	currentPlayer: ID;
}

export type UpdateUserWinsResData = UserWins[];

export interface FinishGame {
	winPlayer: ID;
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

// --------------

export type GamesStorage = Map<ID, GameData>;

type GameData = SingleGameData | PvPGameData;

interface PvPGameData {
	gameId: ID;
	ships: Ship[];
}

export interface PlayerData {
	playerId: string;
	turn: boolean;
	detectedOpponentsCells: DetectedCells;
	damagedShipsStorage: DamagedShipsStorage;
	ships: Ship[];
	hits: number;
}

interface BotData {
	isOpponensShipDamaged: boolean;
	maxLenghtLivingShips: number;
	currentDirrectionOfAttack: DirectionType | null;
	lastShot: Position | null;
	detectedPlayerCells: DetectedCells;
}

export interface SingleGameData {
	gameId: ID;
	player: PlayerData;
	botData: BotData;
}

export type DetectedCells = Set<string>;

export type DamagedShipsStorage = Map<number, Position[]>;
