import { useNavigate, Link, useLocation } from 'react-router-dom'
import { PATHS } from '../constants/paths'
import { useEffect, useState } from 'react'

const Header = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [lastGameId, setLastGameId] = useState<string | null>(null)
    const [lastGameRound, setLastGameRound] = useState<string | null>(null)

    useEffect(() => {
        const storedGameId = sessionStorage.getItem('lastGameId')
        const storedRound = sessionStorage.getItem('lastGameRound')
        setLastGameId(storedGameId)
        setLastGameRound(storedRound)
    }, [location.pathname]) // Re-check on navigation

    const handleRejoin = () => {
        if (lastGameId) {
            navigate(PATHS.GAME.replace(':gameId', lastGameId))
        }
    }

    // Don't show "Rejoin" if we are already in that game
    const showRejoin = lastGameId && !location.pathname.includes(lastGameId)
    console.log(lastGameId);


    return (
        <header className="header">
            <Link to={PATHS.HOME} className="logo-text">MyPointing</Link>
            <nav className="nav-links">
                {showRejoin && (
                    <button type="button" className="btn-primary btn-sm" onClick={handleRejoin}>
                        Rejoin Game {lastGameRound ? `(Round ${lastGameRound})` : ''}
                    </button>
                )}
            </nav>
        </header>
    )
}

export default Header
