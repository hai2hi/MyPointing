import React from 'react'
import '../css/App.css'

interface VotingCardProps {
    value: string
    isActive?: boolean
    onVote: (value: string) => void
}

const VotingCard = React.memo(({ value, isActive, onVote }: VotingCardProps) => {

    return (
        <div
            className={`voting-card voting-card-game ${isActive ? 'active' : ''}`}
            onClick={() => onVote(value)}
        >
            {value}
        </div>
    )
})

export default VotingCard
