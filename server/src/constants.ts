export const DEFAULT_PORT = 3001;

export const SOCKET_EVENTS = {
    JOIN_ROOM: 'joinRoom',
    SUBMIT_VOTE: 'submitVote',
    REVEAL_VOTES: 'revealVotes',
    RESET_VOTES: 'resetVotes',
    ROOM_UPDATED: 'roomUpdated',
    TEST: 'test',
    DISCONNECT: 'disconnect',
    CONNECTION: 'connection',
    DELETE_ROOM: 'deleteRoom',
    ROOM_DELETED: 'roomDeleted',
    LEAVE_ROOM: 'leaveRoom',
    UPDATE_TITLE: 'updateTitle',
    ERROR: 'error',
} as const;

export const ROOM_DELETION_REASONS = {
    MANUAL: 'manual',
    INACTIVITY: 'inactivity',
} as const;
