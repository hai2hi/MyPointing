import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSocketActions } from '../hooks/useSocket'
import GearDropdown from './GearDropdown'
import Modal from './Modal'
import type { Participant } from '../types/socket'
import '../css/App.css'

interface ParticipantsProps {
    participants?: Participant[]
    currentUserId: string
    username: string
}

function Participants({ participants, currentUserId, username }: ParticipantsProps) {
    const { gameId } = useParams<{ gameId: string }>()
    const { passAdmin } = useSocketActions()
    const [pendingAdminTransfer, setPendingAdminTransfer] = useState<Participant | null>(null)
    const [offlineError, setOfflineError] = useState<{ show: boolean, userName: string }>({ show: false, userName: '' })

    const onlineOthers = participants?.filter(other => other.userId !== currentUserId && other.isConnected) || [];

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
                            <div className="flex-center gap-1 relative">
                                <span>{p.displayName} {p.userId === currentUserId ? '(You)' : ''}</span>
                                {
                                    p.isAdmin && <span title="Admin" className="text-sm">⭐</span>
                                }
                                {
                                    p.isAdmin && p.userId === currentUserId && (
                                        <GearDropdown
                                            title="Pass Admin"
                                            iconSize={14}
                                            containerStyle={{ marginLeft: '4px' }}
                                            buttonStyle={{ width: '24px', height: '24px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            menuStyle={{ right: 'auto', left: '0' }}
                                        >
                                            {onlineOthers.map(other => (
                                                <button
                                                    key={other.userId}
                                                    type="button"
                                                    className="dropdown-item"
                                                    onClick={() => setPendingAdminTransfer(other)}
                                                >
                                                    {other.displayName}
                                                </button>
                                            ))}
                                            {onlineOthers.length === 0 && (
                                                <div className="dropdown-item text-italic text-sm text-dim-extra" style={{ pointerEvents: 'none' }}>
                                                    No one else here
                                                </div>
                                            )}
                                        </GearDropdown>
                                    )
                                }
                            </div>
                            <span className="text-sm text-italic">
                                {p.isConnected
                                    ? (p.vote !== null ? p.vote : (p.hasVoted ? 'Voted' : 'Voting...'))
                                    : 'Offline'
                                }
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

            {pendingAdminTransfer && (
                <Modal
                    isOpen={!!pendingAdminTransfer}
                    title="Pass Admin Role?"
                    onClose={() => setPendingAdminTransfer(null)}
                    actions={
                        <div className="flex gap-4 w-full">
                            <button
                                type="button"
                                className="btn-outline flex-1"
                                onClick={() => setPendingAdminTransfer(null)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn-primary flex-1"
                                onClick={() => {
                                    const updatedUser = participants?.find(p => p.userId === pendingAdminTransfer.userId)
                                    if (!updatedUser || !updatedUser.isConnected) {
                                        setOfflineError({ show: true, userName: pendingAdminTransfer.displayName })
                                    } else {
                                        if (gameId) passAdmin(gameId, pendingAdminTransfer.userId)
                                    }
                                    setPendingAdminTransfer(null)
                                }}
                            >
                                Confirm
                            </button>
                        </div>
                    }
                >
                    <p>Are you sure you want to pass the admin role to {pendingAdminTransfer.displayName}? You will no longer have admin privileges.</p>
                </Modal>
            )}

            {offlineError.show && (
                <Modal
                    isOpen={offlineError.show}
                    title="User Offline"
                    onClose={() => setOfflineError({ show: false, userName: '' })}
                    actions={
                        <button
                            type="button"
                            className="btn-primary w-full"
                            onClick={() => setOfflineError({ show: false, userName: '' })}
                        >
                            OK
                        </button>
                    }
                >
                    <p>Cannot pass admin role. {offlineError.userName} is currently offline.</p>
                </Modal>
            )}
        </div>
    )
}

export default Participants
