import { AddShipsReq, AddUserToRoomReq, CreateRoomReq, RequestData, Ship, SHIPS_TYPES, UserDataReq } from '../../types';
import { isNonEmptyString, isNullable, isObject } from '../common';

export function validateUserData(data: RequestData): data is UserDataReq {
	if (!isObject(data)) {
		return false;
	}

	if (!('password' in data) || !('name' in data)) {
		return false;
	}

	if (isNullable(data.name) || isNullable(data.password)) {
		return false;
	}

	if (!isNonEmptyString(data.name) || !isNonEmptyString(data.password)) {
		return false;
	}

	return true;
}

export function validateAddShipsData(data: RequestData): data is AddShipsReq {
	if (!isObject(data)) {
		return false;
	}

	if (!('type' in data)) {
		return false;
	}

	if (!isNonEmptyString(data.type)) {
		return false;
	}

	if (!(data.type in SHIPS_TYPES)) {
		return false;
	}

	if (!('ships' in data)) {
		return false;
	}

	if (!Array.isArray(data.ships)) {
		return false;
	}

	const shipsValid = data.ships.every((ship) => this.validateShipData(ship));

	if (!shipsValid) {
		return false;
	}

	if (!('indexPlayer' in data)) {
		return false;
	}

	return true;
}

export function validateShipData(ship: unknown): ship is Ship {
	if (!isObject(ship)) {
		return false;
	}

	if (!('type' in ship)) {
		return false;
	}

	if (!isNonEmptyString(ship.type)) {
		return false;
	}

	if (!(ship.type in SHIPS_TYPES)) {
		return false;
	}

	if (!('position' in ship)) {
		return false;
	}

	if (!isObject(ship.position)) {
		return false;
	}

	return true;
}

export function validateCreateRoomData(data: RequestData): data is CreateRoomReq {
	return !isNonEmptyString(data);
}

export function validateAddUserToRoomData(data: RequestData): data is AddUserToRoomReq {
	if (!isObject(data)) {
		return false;
	}

	return 'indexRoom' in data;
}
