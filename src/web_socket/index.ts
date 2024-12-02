import { logger } from '../utils';
import { WebSocketServer } from 'ws';
import { handleData } from '../handlers/handleData';

export function startWebSocketServer(port: number = 8181) {
	const wsServer = new WebSocketServer({ port });
	logger(`WebSocket server started on the ${port} port!`);
	wsServer.on('connection', (ws) => {
		const clientId = Date.now();
		logger(`WebSocket client with id: ${clientId} connected!`);
		ws.on('message', (message) => {
			try {
				handleData(ws, message, clientId);
			} catch (error) {
				logger(JSON.stringify(error));
				ws.send(JSON.stringify(error));
			}

			ws.on('close', function close() {
				console.log('Client disconnected');
			});

			ws.on('error', function error(err) {
				console.error('WebSocket Error:', err);
			});
		});
	});
}
