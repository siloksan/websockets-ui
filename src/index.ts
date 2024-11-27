import { httpServer } from './http_server';
import { config } from 'dotenv';
import { startWebSocketServer } from './web_socket';

config();

const HTTP_PORT = Number(process.env.HTTP_PORT ?? 8181);
const WS_PORT = Number(process.env.WS_PORT ?? 3000);

console.log(`Start static http server on the ${HTTP_PORT} port!`);
console.log(`To start game click on the link: http://localhost:${HTTP_PORT}`);
httpServer.listen(HTTP_PORT);
startWebSocketServer(WS_PORT);
