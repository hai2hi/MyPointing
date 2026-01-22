import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket';
import { SOCKET_EVENTS } from '../constants/socket';
import { PATHS } from '../constants/paths';
import type { RoomState } from '../types/socket';
import { SocketStateContext, SocketActionsContext } from './SocketContextValue';
import Modal from '../components/Modal';
import { DELETION_MESSAGES, ROOM_DELETION_REASONS } from '../constants/socket';

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const [roomState, setRoomState] = useState<RoomState | null>(null);
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [deletionReason, setDeletionReason] = useState<string | null>(null);

    useEffect(() => {
        function onConnect() {
            setIsConnected(true);
            setShowErrorModal(false);
            console.log('Connected to socket server');
        }

        function onDisconnect() {
            setIsConnected(false);
            console.log('Disconnected from socket server');
        }

        function onRoomUpdated(state: RoomState) {
            setRoomState(state);
            sessionStorage.setItem('lastGameRound', state.round.toString());
        }

        function onRoomDeleted(reason: string) {
            setDeletionReason(reason || ROOM_DELETION_REASONS.MANUAL);
            setRoomState(null);
            sessionStorage.removeItem('lastGameId');
            sessionStorage.removeItem('lastGameRound');
            navigate(PATHS.NEW_SESSION);
        }

        function onError(message: string) {
            console.error('Socket error:', message);
        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on(SOCKET_EVENTS.ROOM_UPDATED, onRoomUpdated);
        socket.on(SOCKET_EVENTS.ROOM_DELETED, onRoomDeleted);
        socket.on(SOCKET_EVENTS.ERROR, onError);

        socket.connect();

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off(SOCKET_EVENTS.ROOM_UPDATED, onRoomUpdated);
            socket.off(SOCKET_EVENTS.ROOM_DELETED, onRoomDeleted);
            socket.off(SOCKET_EVENTS.ERROR, onError);
            // socket.disconnect();
        };
    }, [navigate]);

    const checkConnection = useCallback(() => {
        if (!socket.connected) {
            setShowErrorModal(true);
            return false;
        }
        return true;
    }, []);

    const joinRoom = useCallback((roomId: string, userId: string, displayName: string) => {
        if (checkConnection()) {
            socket.emit(SOCKET_EVENTS.JOIN_ROOM, roomId, userId, displayName);
        }
    }, [checkConnection]);

    const submitVote = useCallback((roomId: string, userId: string, vote: any) => {
        if (checkConnection()) {
            socket.emit(SOCKET_EVENTS.SUBMIT_VOTE, roomId, userId, vote);
        }
    }, [checkConnection]);

    const revealVotes = useCallback((roomId: string) => {
        if (checkConnection()) {
            socket.emit(SOCKET_EVENTS.REVEAL_VOTES, roomId);
        }
    }, [checkConnection]);

    const resetVotes = useCallback((roomId: string) => {
        if (checkConnection()) {
            socket.emit(SOCKET_EVENTS.RESET_VOTES, roomId);
        }
    }, [checkConnection]);

    const deleteRoom = useCallback((roomId: string) => {
        if (checkConnection()) {
            socket.emit(SOCKET_EVENTS.DELETE_ROOM, roomId);
        }
    }, [checkConnection]);

    const leaveRoom = useCallback((roomId: string, userId: string) => {
        if (checkConnection()) {
            socket.emit(SOCKET_EVENTS.LEAVE_ROOM, roomId, userId);
        }
    }, [checkConnection]);

    const updateTitle = useCallback((roomId: string, title: string) => {
        if (checkConnection()) {
            socket.emit(SOCKET_EVENTS.UPDATE_TITLE, roomId, title);
        }
    }, [checkConnection]);

    const sendTest = useCallback(() => {
        if (checkConnection()) {
            socket.emit(SOCKET_EVENTS.TEST);
        }
    }, [checkConnection]);

    const stateValue = React.useMemo(() => ({
        roomState,
        isConnected
    }), [roomState, isConnected]);

    const actionsValue = React.useMemo(() => ({
        joinRoom,
        submitVote,
        revealVotes,
        resetVotes,
        deleteRoom,
        leaveRoom,
        updateTitle,
        sendTest,
        checkConnection
    }), [
        joinRoom,
        submitVote,
        revealVotes,
        resetVotes,
        deleteRoom,
        leaveRoom,
        updateTitle,
        sendTest,
        checkConnection
    ]);

    return (
        <SocketStateContext.Provider value={stateValue}>
            <SocketActionsContext.Provider value={actionsValue}>
                {children}

                {showErrorModal && (
                    <Modal
                        isOpen={showErrorModal}
                        title="Connection Error"
                        onClose={() => setShowErrorModal(false)}
                        actions={
                            <button
                                type="button"
                                className="btn-primary w-full"
                                onClick={() => setShowErrorModal(false)}
                            >
                                OK
                            </button>
                        }
                    >
                        <p>We're having trouble connecting to the server.</p>
                    </Modal>
                )}

                {deletionReason && (
                    <Modal
                        isOpen={!!deletionReason}
                        title="Room Deleted"
                        onClose={() => {
                            setDeletionReason(null);
                            navigate(PATHS.NEW_SESSION);
                        }}
                        actions={
                            <button
                                type="button"
                                className="btn-primary w-full"
                                onClick={() => {
                                    setDeletionReason(null);
                                    navigate(PATHS.NEW_SESSION);
                                }}
                            >
                                OK
                            </button>
                        }
                    >
                        <p>{DELETION_MESSAGES[deletionReason as keyof typeof DELETION_MESSAGES] || 'The room was deleted.'}</p>
                    </Modal>
                )}
            </SocketActionsContext.Provider>
        </SocketStateContext.Provider>
    );
};


