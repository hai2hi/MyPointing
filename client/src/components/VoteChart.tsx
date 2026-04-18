import React from 'react';
import type { Participant } from '../types/socket';

interface VoteChartProps {
    participants: Participant[];
    title?: string;
}

const COLORS = [
    '#6366f1', // Indigo
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#f43f5e', // Rose
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#0ea5e9', // Sky
    '#64748b', // Slate
];

const VoteChart: React.FC<VoteChartProps> = ({ participants, title }) => {
    const votedParticipants = participants.filter(p => p.hasVoted && p.vote !== null);

    if (votedParticipants.length === 0) {
        return (
            <div className="flex-col-center gap-4 py-8">
                <div className="text-xl text-dim">No votes cast yet</div>
            </div>
        );
    }

    // Group votes
    const voteGroups: Record<string, string[]> = {};
    votedParticipants.forEach(p => {
        const val = p.vote!.toString();
        if (!voteGroups[val]) voteGroups[val] = [];
        voteGroups[val].push(p.displayName);
    });

    const totalVotes = votedParticipants.length;
    const entries = Object.entries(voteGroups).sort((a, b) => {
        // Sort by value (numeric if possible)
        const valA = isNaN(Number(a[0])) ? Infinity : Number(a[0]);
        const valB = isNaN(Number(b[0])) ? Infinity : Number(b[0]);
        return valA - valB;
    });

    // Pie chart logic
    let cumulativePercent = 0;

    const getCoordinatesForPercent = (percent: number) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    return (
        <div className="vote-chart-container flex-col-center">
            {title && (
                <div className="chart-title mb-8">
                    <h2 className="text-2xl text-bold">{title}</h2>
                </div>
            )}
            <div className="flex-center gap-16 w-full chart-content-wrapper">
                <div className="chart-svg-wrapper">
                    <svg viewBox="-1 -1 2 2" className="pie-chart-svg">
                        {entries.map(([value, names], index) => {
                            const count = names.length;
                            const percent = count / totalVotes;
                            const [startX, startY] = getCoordinatesForPercent(cumulativePercent);

                            cumulativePercent += percent;

                            const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
                            const largeArcFlag = percent > 0.5 ? 1 : 0;
                            
                            // If percent is 1, draw a full circle instead of standard arc path to avoid visual bugs
                            let pathData;
                            if (percent === 1) {
                                pathData = `M 1 0 A 1 1 0 1 1 -1 0 A 1 1 0 1 1 1 0`;
                            } else {
                                pathData = [
                                    `M ${startX} ${startY}`,
                                    `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                                    `L 0 0`,
                                ].join(' ');
                            }

                            return (
                                <path
                                    key={value}
                                    d={pathData}
                                    fill={COLORS[index % COLORS.length]}
                                    className="chart-slice"
                                >
                                    <title>Voted by: {names.join(', ')}</title>
                                </path>
                            );
                        })}
                    </svg>
                    <div className="chart-center-overlay">
                        <span className="text-2xl text-bold">{totalVotes}</span>
                        <span className="text-sm text-dim">Votes</span>
                    </div>
                </div>

                <div className="chart-legend">
                    {entries.map(([value, names], index) => {
                        const count = names.length;
                        return (
                            <div key={value} className="legend-item">
                                <div
                                    className="legend-color"
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                <div className="legend-info">
                                    <span className="legend-value">{value}</span>
                                    <span className="legend-count">{count} {count === 1 ? 'vote' : 'votes'}</span>
                                </div>
                                <div className="legend-percent">
                                    {Math.round((count / totalVotes) * 100)}%
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default VoteChart;
