import { useEffect, useRef, useState, useCallback } from 'react'
import Modal from '../components/Modal'
import { useParams, useNavigate, useBlocker } from 'react-router-dom'
import { PATHS } from '../constants/paths'
import VotingCard from '../components/VotingCard'
import Participants from '../components/Participants'
import { useSocketState, useSocketActions } from '../hooks/useSocket'
import { VOTING_OPTIONS } from '../constants/voting'
import VoteChart from '../components/VoteChart'
import RoundTitle from '../components/RoundTitle'
import '../css/App.css'

function GamePage() {
    const { gameId } = useParams<{ gameId: string }>()
    const navigate = useNavigate()
    const gameName = localStorage.getItem(`game_${gameId}`) || 'Planning Session'
    const username = localStorage.getItem('currentUser')
    const [userId] = useState(() => {
        const stored = localStorage.getItem('userId')
        if (stored) return stored
        const newId = Math.random().toString(36).substring(2, 9)
        localStorage.setItem('userId', newId)
        return newId
    })
    const { roomState, isConnected } = useSocketState()
    const { submitVote, resetVotes, revealVotes, joinRoom, deleteRoom, leaveRoom, updateTitle } = useSocketActions()
    const hasJoined = useRef(false)
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)

    // Find current user's vote
    const currentUser = roomState?.participants.find(p => p.userId === userId)
    const currentVote = currentUser?.vote

    const handleVote = useCallback((value: string | number) => {
        if (gameId && userId) {
            submitVote(gameId, userId, value)
        }
    }, [gameId, userId, submitVote])

    // Block navigation if connected to a game
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            isConnected &&
            !!roomState &&
            currentLocation.pathname !== nextLocation.pathname
    );

    useEffect(() => {
        // If no username found, redirect to join page
        if (!username && gameId) {
            navigate(PATHS.JOIN.replace(':gameId', gameId))
            return
        }

        if (!isConnected) {
            hasJoined.current = false
        }

        if (gameId && userId && username && isConnected && !hasJoined.current) {
            joinRoom(gameId, userId, username)
            hasJoined.current = true
            // Save as last active game
            sessionStorage.setItem('lastGameId', gameId)
        }

        return () => {
            if (hasJoined.current) {
                hasJoined.current = false
            }
        }
    }, [gameId, userId, username, joinRoom, isConnected, navigate, leaveRoom])

    const isAdmin = roomState?.participants.find(p => p.userId === userId)?.isAdmin

    // Check if all connected participants have cast a vote
    const connectedParticipants = roomState?.participants.filter(p => p.isConnected) || []
    const allVoted = connectedParticipants.length > 0 && connectedParticipants.every(p => p.hasVoted)

    return (
        <div className="app-container">
            <div className="room-info-bar">
                <div className="room-info-box">
                    <div className="text-bold text-2xl">{gameName}</div>
                </div>
            </div>

            <main className="section game-page-main">
                <div className="container">
                    <div className="game-grid-layout">
                        <div className="estimation-area">
                            <div className="text-xl text-semibold text-dim-extra mb-8">Round {roomState?.round || 1}</div>

                            {!roomState?.votesVisible && (
                                <RoundTitle
                                    initialTitle={roomState?.title || ''}
                                    isAdmin={!!isAdmin}
                                    onUpdate={(title) => gameId && updateTitle(gameId, title)}
                                />
                            )}

                            {roomState?.votesVisible ? (
                                <VoteChart participants={roomState.participants} title={roomState.title} />
                            ) : (
                                <div className="board-container">
                                    {VOTING_OPTIONS.map(option => (
                                        <VotingCard
                                            key={option}
                                            value={option.toString()}
                                            isActive={currentVote?.toString() === option.toString()}
                                            onVote={handleVote}
                                        />
                                    ))}
                                </div>
                            )}

                            <div className="admin-controls mt-16 flex gap-4">
                                {isAdmin && allVoted && !roomState?.votesVisible && (
                                    <button
                                        type="button"
                                        className="btn-primary"
                                        onClick={() => revealVotes(gameId!)}
                                    >
                                        Show Cards
                                    </button>
                                )}
                                {isAdmin && roomState?.votesVisible && (
                                    <button
                                        type="button"
                                        className="btn-outline"
                                        onClick={() => resetVotes(gameId!)}
                                    >
                                        New Round
                                    </button>
                                )}
                                {isAdmin && (
                                    <button
                                        type="button"
                                        className="btn-outline btn-danger"
                                        onClick={() => setShowDeleteConfirmation(true)}
                                    >
                                        Delete Room
                                    </button>
                                )}
                            </div>
                        </div>

                        <Participants
                            participants={roomState?.participants}
                            currentUserId={userId!}
                            username={username || 'Guest'}
                        />
                    </div>
                </div>
            </main>

            <footer className="footer">
                <div>© 2026 MyPointing. All rights reserved.</div>
            </footer>

            {showDeleteConfirmation && (
                <Modal
                    isOpen={showDeleteConfirmation}
                    title="Delete Room?"
                    onClose={() => setShowDeleteConfirmation(false)}
                    actions={
                        <div className="flex gap-4 w-full">
                            <button
                                type="button"
                                className="btn-outline flex-1"
                                onClick={() => setShowDeleteConfirmation(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn-primary btn-danger flex-1"
                                onClick={() => {
                                    deleteRoom(gameId!)
                                    setShowDeleteConfirmation(false)
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    }
                >
                    <p>Are you sure you want to delete this room? This action cannot be undone and all participants will be disconnected.</p>
                </Modal>
            )}

            {blocker.state === 'blocked' && (
                <Modal
                    isOpen={blocker.state === 'blocked'}
                    title="Leave Game?"
                    onClose={() => blocker.reset()}
                    actions={
                        <div className="flex gap-4 w-full">
                            <button
                                type="button"
                                className="btn-outline flex-1"
                                onClick={() => blocker.reset()}
                            >
                                Stay
                            </button>
                            <button
                                type="button"
                                className="btn-primary flex-1"
                                onClick={() => blocker.proceed()}
                            >
                                Leave
                            </button>
                        </div>
                    }
                >
                    <p>Are you sure you want to leave the game? You can rejoin later from the headers.</p>
                </Modal>
            )}
        </div>
    )
}

export default GamePage
