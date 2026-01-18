import '../css/App.css'

interface VotingCardProps {
    value: string
    isActive?: boolean
    onClick?: () => void
}

function VotingCard({ value, isActive, onClick }: VotingCardProps) {
    return (
        <div
            className={`voting-card voting-card-game ${isActive ? 'active' : ''}`}
            onClick={onClick}
        >
            {value}
        </div>
    )
}

export default VotingCard
