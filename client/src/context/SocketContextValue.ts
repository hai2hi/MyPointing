import { createContext } from 'react';
import type { RoomState } from '../types/socket';

export interface SocketContextType {
    roomState: RoomState | null;
    isConnected: boolean;
    joinRoom: (roomId: string, userId: string, displayName: string) => void;
    submitVote: (roomId: string, userId: string, vote: any) => void;
    revealVotes: (roomId: string) => void;
    resetVotes: (roomId: string) => void;
    deleteRoom: (roomId: string) => void;
    leaveRoom: (roomId: string, userId: string) => void;
    sendTest: () => void;
    checkConnection: () => boolean;
}

export const SocketContext = createContext<SocketContextType | undefined>(undefined);
