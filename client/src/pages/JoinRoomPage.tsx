import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PATHS } from '../constants/paths'
import '../css/App.css'


function JoinRoomPage() {
    const { gameId } = useParams<{ gameId: string }>()
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [error, setError] = useState('')

    // If we're here but already have a user, just go to the game
    useEffect(() => {
        const existingUser = localStorage.getItem('currentUser')
        if (existingUser) {
            navigate(PATHS.GAME.replace(':gameId', gameId || ''))
        }
    }, [gameId, navigate])

    const handleJoin = (asGuest: boolean = false) => {
        if (!asGuest && !username.trim()) {
            setError('Please enter a display name')
            return
        }

        const displayName = asGuest ? 'Guest' : username.trim()
        const userId = localStorage.getItem('userId') || Math.random().toString(36).substring(2, 9)

        localStorage.setItem('currentUser', displayName)
        localStorage.setItem('userId', userId)

        navigate(PATHS.GAME.replace(':gameId', gameId || ''))
    }

    return (
        <div className="app-container">
            <main className="section">
                <div className="container max-w-600 text-left">
                    <h1 className="section-title">Join Room</h1>
                    <p className="section-description mb-8">
                        You're about to join room <span className="text-bold">{gameId}</span>.
                        How should you appear to others?
                    </p>

                    <div className="form-group">
                        <label className="form-label">Display Name</label>
                        <input
                            type="text"
                            className={`form-input ${error ? 'error' : ''}`}
                            placeholder="e.g. John Doe"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value)
                                setError('')
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                            autoFocus
                        />
                        {error && <div className="error-message">{error}</div>}
                    </div>

                    <div className="flex-col gap-4 mt-8">
                        <button
                            type="button"
                            className="btn-primary w-full"
                            onClick={() => handleJoin()}
                            disabled={!username.trim()}
                        >
                            Join Room
                        </button>

                        <div className="text-center text-dim text-sm">- or -</div>

                        <button
                            type="button"
                            className="btn-outline w-full"
                            onClick={() => handleJoin(true)}
                        >
                            Join as Guest
                        </button>
                    </div>
                </div>
            </main>

            <footer className="footer">
                <div>© 2026 MyPointing. All rights reserved.</div>
            </footer>
        </div>
    )
}

export default JoinRoomPage
