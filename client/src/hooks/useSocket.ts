import { useContext } from 'react';
import { SocketStateContext, SocketActionsContext } from '../context/SocketContextValue';

export const useSocketState = () => {
    const context = useContext(SocketStateContext);
    if (!context) {
        throw new Error('useSocketState must be used within a SocketProvider');
    }
    return context;
};

export const useSocketActions = () => {
    const context = useContext(SocketActionsContext);
    if (!context) {
        throw new Error('useSocketActions must be used within a SocketProvider');
    }
    return context;
};

export const useSocket = () => {
    const state = useSocketState();
    const actions = useSocketActions();
    return { ...state, ...actions };
};
