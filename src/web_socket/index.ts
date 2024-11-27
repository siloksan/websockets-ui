import { Buffer } from 'node:buffer';
import { logger } from '../utils';
import { WebSocketServer } from 'ws';

export function startWebSocketServer(port: number = 8181) {
	const wsServer = new WebSocketServer({ port });
	logger(`WebSocket server started on the ${port} port!`);
	wsServer.on('connection', (ws) => {
		logger('WebSocket client connected!');
		ws.on('message', (message) => {
			console.log('Received message:', typeof message);
			ws.send(JSON.stringify({ message: 'Welcome to the WebSocket server!' }));
			console.log('message instanceof ArrayBuffer: ', message instanceof ArrayBuffer);

			if (Buffer.isBuffer(message)) {
				const messageString = message.toString('utf-8');
				const data = JSON.parse(messageString);
				handleData(data);
			} else if (typeof message === 'string') {
				console.log('Received text data:', message);
			} else {
				console.log('Received object data:', message);
			}

			// Parse the received JSON data

			// Respond back to the client with processed data
			const response = { response: 'Message received successfully' };
			ws.send(JSON.stringify(response));

			ws.on('close', function close() {
				console.log('Client disconnected');
			});

			// Handle errors
			ws.on('error', function error(err) {
				console.error('WebSocket Error:', err);
			});
		});
	});
}

function handleData(data: string) {
	// Do something with the received data here
	console.log('Processing data:', data);
}
