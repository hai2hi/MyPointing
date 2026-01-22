export type VoteValue = 0 | 1 | 2 | 3 | 5 | 8 | 13 | 21 | '?' | null;

export interface Participant {
    userId: string;
    displayName: string;
    isAdmin: boolean;
    isConnected: boolean;
    vote: VoteValue | null;
    hasVoted: boolean;
}

export interface RoundResult {
    round: number;
    title: string;
    votes: {
        userId: string;
        displayName: string;
        vote: VoteValue;
    }[];
}

export interface RoomState {
    roomId: string;
    participants: Participant[];
    votesVisible: boolean;
    round: number;
    title: string;
    history: RoundResult[];
}

export interface ServerToClientEvents {
    roomUpdated: (state: RoomState) => void;
    error: (message: string) => void;
    test: (count: number) => void;
    roomDeleted: (reason: string) => void;
}

export interface ClientToServerEvents {
    joinRoom: (roomId: string, userId: string, displayName: string) => void;
    submitVote: (roomId: string, userId: string, vote: VoteValue) => void;
    revealVotes: (roomId: string) => void;
    resetVotes: (roomId: string) => void;
    deleteRoom: (roomId: string) => void;
    leaveRoom: (roomId: string, userId: string) => void;
    updateTitle: (roomId: string, title: string) => void;
    test: () => void;
}

export interface SocketData {
    userId: string;
    roomId: string;
}

