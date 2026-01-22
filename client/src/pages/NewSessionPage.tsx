import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PATHS } from '../constants/paths'
import { useSocket } from '../hooks/useSocket'
import '../css/App.css'

function NewSessionPage() {
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [gameName, setGameName] = useState('')
    const [errors, setErrors] = useState<{ username?: string; gameName?: string }>({})
    const { checkConnection } = useSocket()

    const handleCreateGame = (e: React.FormEvent) => {
        e.preventDefault()

        const newErrors: { username?: string; gameName?: string } = {}
        if (!username.trim()) newErrors.username = 'Username is required'
        if (!gameName.trim()) newErrors.gameName = 'Game name is required'

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        // Generate IDs
        const mockGameId = Math.random().toString(36).substring(2, 9)
        const userId = localStorage.getItem('userId') || Math.random().toString(36).substring(2, 9)

        // Persist info
        localStorage.setItem(`game_${mockGameId}`, gameName)
        localStorage.setItem('currentUser', username)
        localStorage.setItem('userId', userId)

        if (!checkConnection()) {
            return
        }

        navigate(PATHS.GAME.replace(':gameId', mockGameId))
    }

    return (
        <div className="app-container">
            <main>
                <section className="section">
                    <div className="container max-w-600 text-left">
                        <h1 className="section-title">Create New Session</h1>

                        <form className="new-session-form" onSubmit={handleCreateGame}>
                            <div className="form-group">
                                <label className="form-label">Your username</label>
                                <input
                                    type="text"
                                    className={`form-input ${errors.username ? 'error' : ''}`}
                                    placeholder="e.g. John Doe"
                                    value={username}
                                    onChange={(e) => {
                                        setUsername(e.target.value)
                                        if (errors.username) setErrors({ ...errors, username: undefined })
                                    }}
                                />
                                {errors.username && <div className="error-message">{errors.username}</div>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Game Name</label>
                                <input
                                    type="text"
                                    className={`form-input ${errors.gameName ? 'error' : ''}`}
                                    placeholder="e.g. Sprint 42 Planning"
                                    value={gameName}
                                    onChange={(e) => {
                                        setGameName(e.target.value)
                                        if (errors.gameName) setErrors({ ...errors, gameName: undefined })
                                    }}
                                />
                                {errors.gameName && <div className="error-message">{errors.gameName}</div>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Voting System</label>
                                <div className="voting-options">
                                    <div className="voting-card active">
                                        <div className="voting-name">Fibonacci</div>
                                        <div className="voting-preview">0, 1, 2, 3, 5, 8, 13, 21, ...</div>
                                    </div>
                                </div>
                            </div>

                            {/* <div className="form-group">
                                <label className="form-label">Advanced Options</label>
                                <div className="toggle-group">
                                    <div className="toggle-item">
                                        <span>Auto-reveal cards</span>
                                        <div className="toggle-switch"></div>
                                    </div>
                                    <div className="toggle-item">
                                        <span>Allow changing votes</span>
                                        <div className="toggle-switch active"></div>
                                    </div>
                                </div>
                            </div> */}

                            <button type="submit" className="btn-primary btn-lg w-full mt-8">
                                Create Game
                            </button>
                        </form>
                    </div>
                </section>
            </main>

            <footer className="footer">
                <div>© 2026 MyPointing. All rights reserved.</div>
            </footer>
        </div>
    )
}

export default NewSessionPage
