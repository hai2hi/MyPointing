import { useNavigate, Link, useLocation } from 'react-router-dom'
import { PATHS } from '../constants/paths'
import React, { useEffect, useState } from 'react'
import { useSocketState } from '../hooks/useSocket'
import Modal from './Modal'

const RejoinButton = ({ lastGameId, lastGameRound }: { lastGameId: string, lastGameRound: string | null }) => {
    const navigate = useNavigate()
    const handleRejoin = () => {
        navigate(PATHS.GAME.replace(':gameId', lastGameId))
    }
    return (
        <button type="button" className="btn-primary btn-sm" onClick={handleRejoin}>
            Rejoin Game {lastGameRound ? `(Round ${lastGameRound})` : ''}
        </button>
    )
}

const ResultsView = () => {
    const { roomState } = useSocketState()
    const [showHistory, setShowHistory] = useState(false)
    const hasHistory = roomState?.history && roomState.history.length > 0
    const currentRevealed = roomState?.votesVisible

    if (!hasHistory && !currentRevealed) return null

    // Combine history with current round if it's revealed
    const displayHistory = [...(roomState?.history || [])]
    if (currentRevealed && roomState) {
        displayHistory.push({
            round: roomState.round,
            title: roomState.title,
            votes: roomState.participants
                .filter(p => p.hasVoted && p.vote !== null)
                .map(p => ({
                    userId: p.userId,
                    displayName: p.displayName,
                    vote: p.vote!
                }))
        })
    }

    return (
        <>
            <button type="button" className="btn-primary btn-sm" onClick={() => setShowHistory(true)}>
                Results
            </button>
            {showHistory && (
                <Modal
                    isOpen={showHistory}
                    title="Game Results"
                    onClose={() => setShowHistory(false)}
                    actions={
                        <button type="button" className="btn-primary w-full" onClick={() => setShowHistory(false)}>
                            Close
                        </button>
                    }
                >
                    <div className="history-list flex-col gap-4" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                        {displayHistory.slice().reverse().map((round, idx) => (
                            <div key={idx} className="history-round p-16 border-dim rounded-lg" style={{ border: '1px solid var(--border-dim)', padding: '1.5rem', marginBottom: '1rem' }}>
                                <div className="flex-baseline-between mb-4">
                                    <h3 className="text-xl text-bold">Round {round.round}</h3>
                                    <span className="text-dim text-sm">{round.title || 'No Title'}</span>
                                </div>
                                <div className="history-votes grid gap-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.5rem' }}>
                                    {round.votes.map((v, vIdx) => (
                                        <div key={vIdx} className="flex-center gap-1 p-2 bg-secondary rounded" style={{ padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: '4px' }}>
                                            <span className="text-sm">{v.displayName}:</span>
                                            <span className="text-bold">{v.vote}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </Modal>
            )}
        </>
    )
}

const Header = React.memo(() => {
    const location = useLocation()
    const [lastGameId, setLastGameId] = useState<string | null>(null)
    const [lastGameRound, setLastGameRound] = useState<string | null>(null)

    useEffect(() => {
        const storedGameId = sessionStorage.getItem('lastGameId')
        const storedRound = sessionStorage.getItem('lastGameRound')
        setLastGameId(storedGameId)
        setLastGameRound(storedRound)
    }, [location.pathname]) // Re-check on navigation

    // Don't show "Rejoin" if we are already on any game page
    const showRejoin = lastGameId && !location.pathname.includes('/game/')

    const handleInvite = () => {
        let url = window.location.href
        if (import.meta.env.PROD && import.meta.env.VITE_CLIENT_URL) {
            url = `${import.meta.env.VITE_CLIENT_URL}${location.pathname}${location.search}`
        }

        console.log(url);

        navigator.clipboard.writeText(url).then(() => {
            alert('Room URL copied to clipboard!')
        }).catch(err => {
            console.error('Failed to copy: ', err)
        })
    }

    return (
        <header className="header">
            <Link to={PATHS.HOME} className="logo-text">MyPointing</Link>
            <nav className="nav-links">
                {location.pathname.includes('/game/') && (
                    <>
                        <ResultsView />
                        <button type="button" className="btn-outline btn-sm" onClick={handleInvite}>
                            Invite
                        </button>
                    </>
                )}
                {showRejoin && lastGameId && (
                    <RejoinButton lastGameId={lastGameId} lastGameRound={lastGameRound} />
                )}
            </nav>
        </header>
    )
})

export default Header
