import { useEffect, useRef, useState } from 'react'
import Modal from '../components/Modal'
import { useParams, Link, useNavigate, useBlocker } from 'react-router-dom'
import { PATHS } from '../constants/paths'
import VotingCard from '../components/VotingCard'
import Participants from '../components/Participants'
import { useSocket } from '../hooks/useSocket'
import { VOTING_OPTIONS } from '../constants/voting'
import '../css/App.css'

function GamePage() {
    const { gameId } = useParams<{ gameId: string }>()
    const navigate = useNavigate()
    const gameName = localStorage.getItem(`game_${gameId}`) || 'Planning Session'
    const username = localStorage.getItem('currentUser')
    const userId = localStorage.getItem('userId') || Math.random().toString(36).substring(2, 9)
    const { sendTest, roomState, resetVotes, revealVotes, joinRoom, isConnected, deleteRoom } = useSocket()
    const hasJoined = useRef(false)
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)

    // Block navigation if connected to a game
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            isConnected &&
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
            localStorage.setItem('lastGameId', gameId)
        }

        return () => {
            // Optional: reset if we want to allow re-joining on remount
            // hasJoined.current = false 
        }
    }, [gameId, userId, username, joinRoom, isConnected, navigate])

    return (
        <div className="app-container">
            <header className="header">
                <Link to={PATHS.HOME} className="logo-text">MyPointing</Link>
                <div className="room-info-box">
                    <div className="text-bold text-lg">{gameName}</div>
                    <div className="text-sm text-dim">ID: {gameId}</div>
                </div>
                <nav className="nav-links">
                    <button type="button" className="btn-outline">Invite</button>
                </nav>
            </header>

            <main className="section game-page-main">
                <div className="container">
                    <div className="game-grid-layout">
                        <div className="estimation-area">
                            <div className="flex-baseline-between">
                                <h2 className="section-title text-left text-2xl">Estimation</h2>
                                <div className="text-xl text-semibold text-dim-extra">Round {roomState?.round || 1}</div>
                            </div>

                            <div className="board-container">
                                {VOTING_OPTIONS.map(option => (
                                    <VotingCard key={option} value={option} />
                                ))}
                            </div>

                            <div className="admin-controls mt-16 flex gap-4">
                                <button type="button" className="btn-primary" onClick={() => { revealVotes(gameId!); sendTest(); }}>Show Cards</button>
                                <button type="button" className="btn-outline" onClick={() => resetVotes(gameId!)}>Clear Board</button>
                                {roomState?.participants.find(p => p.userId === userId)?.isAdmin && (
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
