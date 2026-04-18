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
    handleLeaveRoom,
    handleDisconnect,
    handleTest,
    handleUpdateTitle,
    handleClearVotes,
    handlePassAdmin
} from './handlers.js';
import { DEFAULT_PORT, SOCKET_EVENTS } from './constants.js';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || '*',
        methods: ['GET', 'POST'],
        credentials: true
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

    socket.on(SOCKET_EVENTS.UPDATE_TITLE, (roomId, title) => {
        handleUpdateTitle(io, socket, roomId, title);
    });

    socket.on(SOCKET_EVENTS.RESET_VOTES, (roomId) => handleResetVotes(io, socket, roomId));
    socket.on(SOCKET_EVENTS.CLEAR_VOTES, (roomId) => handleClearVotes(io, socket, roomId));
    socket.on(SOCKET_EVENTS.DELETE_ROOM, (roomId) => handleDeleteRoom(io, roomId, socket));
    socket.on(SOCKET_EVENTS.LEAVE_ROOM, (roomId, userId) => handleLeaveRoom(io, socket, roomId, userId));
    socket.on(SOCKET_EVENTS.PASS_ADMIN, (roomId, newAdminId) => handlePassAdmin(io, socket, roomId, newAdminId));
    socket.on(SOCKET_EVENTS.DISCONNECT, () => handleDisconnect(io, socket));

    socket.on(SOCKET_EVENTS.TEST, () => {
        handleTest(socket);
    });
});

const PORT = process.env.PORT || DEFAULT_PORT;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
