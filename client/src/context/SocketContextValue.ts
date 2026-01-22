import { createContext } from 'react';
import type { RoomState } from '../types/socket';

export interface SocketStateContextType {
    roomState: RoomState | null;
    isConnected: boolean;
}

export interface SocketActionsContextType {
    joinRoom: (roomId: string, userId: string, displayName: string) => void;
    submitVote: (roomId: string, userId: string, vote: any) => void;
    revealVotes: (roomId: string) => void;
    resetVotes: (roomId: string) => void;
    deleteRoom: (roomId: string) => void;
    leaveRoom: (roomId: string, userId: string) => void;
    updateTitle: (roomId: string, title: string) => void;
    sendTest: () => void;
    checkConnection: () => boolean;
}

export const SocketStateContext = createContext<SocketStateContextType | undefined>(undefined);
export const SocketActionsContext = createContext<SocketActionsContextType | undefined>(undefined);
