import { Server, Socket } from 'socket.io';
import {
    type ClientToServerEvents,
    type ServerToClientEvents,
    type RoomState,
    type VoteValue,
    type RoundResult,
    type SocketData
} from './types.js';
import { SOCKET_EVENTS, ROOM_DELETION_REASONS } from './constants.js';

// In-memory state
const rooms: Record<string, RoomState> = {};
const roomDeletionTimeouts: Record<string, NodeJS.Timeout> = {};
const deletedRooms: Map<string, string> = new Map(); // Map roomId -> reason
const TOMBSTONE_TTL = 24 * 60 * 60 * 1000; // 24 hours

const ROOM_DELETION_GRACE_PERIOD = 1 * 60 * 1000; // 5 minutes

// Helper to get sanitized room state (hiding votes if not revealed, except for the user themselves)
export const getSanitizedRoomState = (room: RoomState, perspectiveUserId?: string): RoomState => {
    return {
        ...room,
        participants: room.participants.map(p => ({
            ...p,
            vote: (room.votesVisible || p.userId === perspectiveUserId) ? p.vote : null,
        })),
    };
};

// Helper to broadcast personalized room state to all connected participants
const broadcastRoomState = (
    io: Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>,
    roomId: string
) => {
    const room = rooms[roomId];
    if (!room) return;

    // Get all sockets in the room
    const sockets = io.sockets.adapter.rooms.get(roomId);
    if (!sockets) return;

    sockets.forEach(socketId => {
        const socket = io.sockets.sockets.get(socketId);
        if (socket) {
            const userId = socket.data.userId;
            socket.emit(SOCKET_EVENTS.ROOM_UPDATED, getSanitizedRoomState(room, userId));
        }
    });
};

const clearDeletionTimer = (roomId: string) => {
    if (roomDeletionTimeouts[roomId]) {
        clearTimeout(roomDeletionTimeouts[roomId]);
        delete roomDeletionTimeouts[roomId];
        return true;
    }
    return false;
};

const deleteRoom = (
    io: Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>,
    roomId: string,
    reason: string
) => {
    console.log(`Room ${roomId} everybody's out! Reason: ${reason}`);
    io.to(roomId).emit(SOCKET_EVENTS.ROOM_DELETED, reason);

    clearDeletionTimer(roomId);
    delete rooms[roomId];

    deletedRooms.set(roomId, reason);
    setTimeout(() => {
        deletedRooms.delete(roomId);
    }, TOMBSTONE_TTL);

    // Force all sockets in the room to leave (delayed to ensure event is sent)
    setTimeout(() => {
        io.in(roomId).socketsLeave(roomId);
    }, 1000);
};

const notifyIfRoomDeleted = (
    socket: Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>,
    roomId: string
): boolean => {
    if (deletedRooms.has(roomId)) {
        const reason = deletedRooms.get(roomId) || ROOM_DELETION_REASONS.MANUAL;
        socket.emit(SOCKET_EVENTS.ROOM_DELETED, reason);
        return true;
    }
    return false;
};

export const handleJoinRoom = (
    io: Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>,
    socket: Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>,
    roomId: string,
    userId: string,
    displayName: string
) => {
    // If the socket is already in a different room, leave it first
    if (socket.data.roomId && socket.data.roomId !== roomId) {
        handleLeaveRoom(io, socket, socket.data.roomId, userId);
    }

    socket.join(roomId);

    // Check if room was recently deleted
    if (notifyIfRoomDeleted(socket, roomId)) {
        console.log(`User ${userId} attempted to join deleted room ${roomId}`);
        return;
    }

    if (!rooms[roomId]) {
        rooms[roomId] = {
            roomId,
            participants: [],
            votesVisible: false,
            round: 1,
            title: '',
            history: [],
        };
    }

    // Clear any pending deletion timeout if it exists
    if (clearDeletionTimer(roomId)) {
        console.log(`Room deletion cancelled for ${roomId} as user joined`);
    }

    const room = rooms[roomId];
    if (!room) {
        console.log(`Room not found: ${roomId}`);
        return;
    }

    const existingParticipant = room.participants.find(p => p.userId === userId);

    if (existingParticipant) {
        existingParticipant.isConnected = true;
        existingParticipant.displayName = displayName;
    } else {
        room.participants.push({
            userId,
            displayName,
            isAdmin: room.participants.length === 0,
            isConnected: true,
            vote: null,
            hasVoted: false,
        });
    }

    const activeCount = room.participants.filter(p => p.isConnected).length;
    if (existingParticipant && !deletedRooms.has(roomId)) {
        console.log(`User ${displayName} (${userId}) reconnected to ${roomId} (Round ${room.round}). Active: ${activeCount}`);
    } else {
        console.log(`User ${displayName} (${userId}) joined room ${roomId} (Round ${room.round}). Active: ${activeCount}`);
    }

    // Set socket metadata for disconnect tracking
    socket.data.userId = userId;
    socket.data.roomId = roomId;

    broadcastRoomState(io, roomId);
};

export const handleSubmitVote = (
    io: Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>,
    socket: Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>,
    roomId: string,
    userId: string,
    vote: VoteValue
) => {
    const room = rooms[roomId];
    if (!room) {
        notifyIfRoomDeleted(socket, roomId);
        console.log(`Room not found: ${roomId}`);
        return;
    }

    const participant = room.participants.find(p => p.userId === userId);
    if (!participant) return;

    // Toggle logic: if the same vote is submitted, clear it (deselect)
    const newVote = participant.vote === vote ? null : vote;
    participant.vote = newVote;
    participant.hasVoted = newVote !== null;

    broadcastRoomState(io, roomId);
    console.log(`User ${userId} voted ${vote} in room ${roomId}`);
};

export const handleUpdateTitle = (
    io: Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>,
    socket: Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>,
    roomId: string,
    title: string
) => {
    const room = rooms[roomId];
    if (!room) {
        notifyIfRoomDeleted(socket, roomId);
        console.log(`Room not found: ${roomId}`);
        return;
    }

    room.title = title;
    broadcastRoomState(io, roomId);
    const userId = socket.data.userId;
    console.log(`User ${userId} updated title to "${title}" in room ${roomId}`);
};

export const handleRevealVotes = (
    io: Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>,
    socket: Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>,
    roomId: string
) => {
    const room = rooms[roomId];
    if (!room) {
        notifyIfRoomDeleted(socket, roomId);
        console.log(`Room not found: ${roomId}`);
        return;
    }

    room.votesVisible = true;
    broadcastRoomState(io, roomId);
    console.log(`Votes revealed in room ${roomId}`);
};

export const handleResetVotes = (
    io: Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>,
    socket: Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>,
    roomId: string
) => {
    const room = rooms[roomId];
    if (!room) {
        notifyIfRoomDeleted(socket, roomId);
        console.log(`Room not found: ${roomId}`);
        return;
    }

    // Save current round to history before resetting
    const result: RoundResult = {
        round: room.round,
        title: room.title,
        votes: room.participants
            .filter(p => p.hasVoted && p.vote !== null)
            .map(p => ({
                userId: p.userId,
                displayName: p.displayName,
                vote: p.vote!
            }))
    };
    room.history.push(result);

    room.votesVisible = false;
    room.round += 1;
    room.title = '';
    room.participants.forEach(p => {
        p.vote = null;
        p.hasVoted = false;
    });

    // Reset test counter for the next round
    testCounter = 0;

    broadcastRoomState(io, roomId);
    console.log(`Votes reset in room ${roomId}`);
};

export const handleDeleteRoom = (
    io: Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>,
    roomId: string,
    socket: Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>
) => {
    const room = rooms[roomId];
    if (!room) {
        console.log(`Room not found: ${roomId}`);
        return;
    }

    // Check if the user is an admin
    const userId = socket.data.userId;
    const participant = room.participants.find(p => p.userId === userId);

    if (!participant || !participant.isAdmin) {
        console.log(`Unauthorized delete attempt for room ${roomId} by user ${userId}`);
        socket.emit(SOCKET_EVENTS.ERROR, 'Only admins can delete the room.');
        return;
    }

    console.log(`Room ${roomId} is being deleted by admin ${userId}`);
    deleteRoom(io, roomId, ROOM_DELETION_REASONS.MANUAL);
};

export const handleDisconnect = (
    io: Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>,
    socket: Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>
) => {
    const userId = socket.data.userId;
    const roomId = socket.data.roomId;

    if (userId && roomId && rooms[roomId]) {
        const room = rooms[roomId];
        if (!room) {
            console.log(`Room not found: ${roomId}`);
            return;
        }

        const participant = room.participants.find(p => p.userId === userId);
        if (participant) {
            participant.isConnected = false;
            const allOffline = room.participants.every(p => !p.isConnected);

            if (allOffline) {
                console.log(`All participants offline in room ${roomId}. Starting ${ROOM_DELETION_GRACE_PERIOD / 1000 / 60}m deletion timer.`);

                // Clear existing timeout if any
                clearDeletionTimer(roomId);

                roomDeletionTimeouts[roomId] = setTimeout(() => {
                    const room = rooms[roomId];
                    if (room) {
                        deleteRoom(io, roomId, ROOM_DELETION_REASONS.INACTIVITY);
                        console.log(`Room ${roomId} deleted after grace period`);
                    }
                }, ROOM_DELETION_GRACE_PERIOD);
            } else {
                const activeCount = room.participants.filter(p => p.isConnected).length;
                console.log(`User ${userId} disconnected from ${roomId}. Active: ${activeCount}`);
                broadcastRoomState(io, roomId);
            }
        }
    }
};

export const handleLeaveRoom = (
    io: Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>,
    socket: Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>,
    roomId: string,
    userId: string
) => {
    const room = rooms[roomId];
    if (!room) return;

    const participant = room.participants.find(p => p.userId === userId);
    if (participant) {
        participant.isConnected = false;
        console.log(`User ${participant.displayName} (${userId}) logically left room ${roomId}`);
    }

    const allOffline = room.participants.every(p => !p.isConnected);
    if (allOffline) {
        console.log(`All participants offline in room ${roomId} after logical leave. Starting ${ROOM_DELETION_GRACE_PERIOD / 1000 / 60}m deletion timer.`);

        clearDeletionTimer(roomId);
        roomDeletionTimeouts[roomId] = setTimeout(() => {
            const r = rooms[roomId];
            if (r) {
                deleteRoom(io, roomId, ROOM_DELETION_REASONS.INACTIVITY);
            }
        }, ROOM_DELETION_GRACE_PERIOD);
    } else {
        broadcastRoomState(io, roomId);
    }

    socket.leave(roomId);
};

let testCounter = 0;
export const handleTest = (
    socket: Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>
) => {
    testCounter += 1;
    socket.emit(SOCKET_EVENTS.TEST, testCounter);
    console.log(`Test event triggered. Counter: ${testCounter}`);
};
