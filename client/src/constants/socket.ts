export const SOCKET_EVENTS = {
    JOIN_ROOM: 'joinRoom',
    SUBMIT_VOTE: 'submitVote',
    REVEAL_VOTES: 'revealVotes',
    RESET_VOTES: 'resetVotes',
    ROOM_UPDATED: 'roomUpdated',
    TEST: 'test',
    ERROR: 'error',
    DELETE_ROOM: 'deleteRoom',
    ROOM_DELETED: 'roomDeleted'
} as const;

export const ROOM_DELETION_REASONS = {
    MANUAL: 'manual',
    INACTIVITY: 'inactivity',
} as const;

export const DELETION_MESSAGES = {
    [ROOM_DELETION_REASONS.MANUAL]: 'The room has been deleted by the admin.',
    [ROOM_DELETION_REASONS.INACTIVITY]: 'The room has expired due to inactivity.',
} as const;
