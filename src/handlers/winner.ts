import WebSocket from 'ws';
import { TYPES_OF_MESSAGES, Winner } from '../types';

export class WinnersHandler {
	private readonly winners: Winner[] = [];

	validate() {
		return true;
	}

	public updateWinners(client: WebSocket) {
		const winnersStringify = this.winners.map((winner: Winner) => JSON.stringify(winner));

		client.send(JSON.stringify({ type: TYPES_OF_MESSAGES.update_winners, data: JSON.stringify(winnersStringify) }));
	}

	// public createRoom(data: string) {}
}

export const winnerHandler = new WinnersHandler();
