import { io, Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from './types/socket';

const URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(URL, {
    autoConnect: false,
    transports: ['websocket'],
    reconnectionDelay: 5000
});

