import type { Participant } from '../types/socket'
import '../css/App.css'

interface ParticipantsProps {
    participants?: Participant[]
    currentUserId: string
    username: string
}

function Participants({ participants, currentUserId, username }: ParticipantsProps) {
    return (
        <div className="participants-sidebar">
            <h3 className="text-xl mt-8">Participants</h3>
            <div className="participant-list flex-col-center gap-2 mt-8">
                {
                    participants?.map(p => (
                        <div
                            key={p.userId}
                            className={`participant-item w-full participant-item-row ${p.isConnected ? 'participant-online' : 'participant-offline'}`}
                        >
                            <div className="flex-center gap-1">
                                <span>{p.displayName} {p.userId === currentUserId ? '(You)' : ''}</span>
                                {
                                    p.isAdmin && <span title="Admin" className="text-sm">⭐</span>
                                }
                            </div>
                            <span className="text-sm text-italic">
                                {p.isConnected ? (p.hasVoted ? 'Voted' : 'Voting...') : 'Offline'}
                            </span>
                        </div>
                    ))
                }
                {
                    (!participants || participants.length === 0) && (
                        <div className="participant-item w-full participant-item-row participant-online">
                            <span>{username} (You)</span>
                            <span className="text-sm text-italic">Connecting...</span>
                        </div>
                    )
                }
            </div>
        </div>
    )
}

export default Participants
