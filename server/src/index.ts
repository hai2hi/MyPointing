import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import {
    type ClientToServerEvents,
    type ServerToClientEvents,
    type SocketData
} from './types.js';
import {
    handleJoinRoom,
    handleSubmitVote,
    handleRevealVotes,
    handleResetVotes,
    handleDeleteRoom,
    handleDisconnect,
    handleTest
} from './handlers.js';
import { DEFAULT_PORT, SOCKET_EVENTS } from './constants.js';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>(httpServer, {
    cors: {
        origin: '*',
    },
    transports: ['websocket']
});

io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
    console.log('User connected socket:', socket.id);

    socket.on(SOCKET_EVENTS.JOIN_ROOM, (roomId, userId, displayName) => {
        handleJoinRoom(io, socket, roomId, userId, displayName);
    });

    socket.on(SOCKET_EVENTS.SUBMIT_VOTE, (roomId, userId, vote) => {
        handleSubmitVote(io, socket, roomId, userId, vote);
    });

    socket.on(SOCKET_EVENTS.REVEAL_VOTES, (roomId) => {
        handleRevealVotes(io, socket, roomId);
    });

    socket.on(SOCKET_EVENTS.RESET_VOTES, (roomId) => {
        handleResetVotes(io, socket, roomId);
    });
    socket.on(SOCKET_EVENTS.DELETE_ROOM, (roomId) => {
        handleDeleteRoom(io, roomId, socket);
    });

    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
        handleDisconnect(io, socket);
    });

    socket.on(SOCKET_EVENTS.TEST, () => {
        handleTest(socket);
    });
});

const PORT = process.env.PORT || DEFAULT_PORT;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
