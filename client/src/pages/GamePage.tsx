import { useEffect, useRef, useState, useCallback } from 'react'
import Modal from '../components/Modal'
import { useParams, useNavigate, useBlocker } from 'react-router-dom'
import { PATHS } from '../constants/paths'
import VotingCard from '../components/VotingCard'
import Participants from '../components/Participants'
import { useSocket } from '../hooks/useSocket'
import { VOTING_OPTIONS } from '../constants/voting'
import VoteChart from '../components/VoteChart'
import '../css/App.css'

function GamePage() {
    const { gameId } = useParams<{ gameId: string }>()
    const navigate = useNavigate()
    const gameName = localStorage.getItem(`game_${gameId} `) || 'Planning Session'
    const username = localStorage.getItem('currentUser')
    const [userId] = useState(() => {
        const stored = localStorage.getItem('userId')
        if (stored) return stored
        const newId = Math.random().toString(36).substring(2, 9)
        localStorage.setItem('userId', newId)
        return newId
    })
    const { roomState, submitVote, resetVotes, revealVotes, joinRoom, isConnected, deleteRoom, leaveRoom } = useSocket()
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
            if (gameId && userId && hasJoined.current) {
                leaveRoom(gameId, userId)
                hasJoined.current = false
            }
        }
    }, [gameId, userId, username, joinRoom, isConnected, navigate, leaveRoom])

    const isAdmin = roomState?.participants.find(p => p.userId === userId)?.isAdmin
    return (
        <div className="app-container">
            <div className="room-info-bar">
                <div className="room-info-box">
                    <div className="text-bold text-lg">{gameName}</div>
                    <div className="text-sm text-dim">ID: {gameId}</div>
                </div>
                <nav className="nav-links">
                    <button type="button" className="btn-outline">Invite</button>
                </nav>
            </div>

            <main className="section game-page-main">
                <div className="container">
                    <div className="game-grid-layout">
                        <div className="estimation-area">
                            <div className="flex-baseline-between">
                                <h2 className="section-title text-left text-2xl">Estimation</h2>
                                <div className="text-xl text-semibold text-dim-extra">Round {roomState?.round || 1}</div>
                            </div>

                            {roomState?.votesVisible ? (
                                <VoteChart participants={roomState.participants} />
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
                                <button type="button" className="btn-primary" onClick={() => revealVotes(gameId!)}>Show Cards</button>
                                <button type="button" className="btn-outline" onClick={() => resetVotes(gameId!)}>Clear Board</button>
                                {isAdmin && (
                                    <button type="button" className="btn-outline btn-danger" onClick={() => setShowDeleteConfirmation(true)}>Delete Room</button>
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
