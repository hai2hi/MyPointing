import React, { useState, useEffect } from 'react';

interface RoundTitleProps {
    initialTitle: string;
    isAdmin: boolean;
    onUpdate: (title: string) => void;
}

const RoundTitle = ({ initialTitle, isAdmin, onUpdate }: RoundTitleProps) => {
    const [localTitle, setLocalTitle] = useState(initialTitle);

    // Sync with external updates (e.g., round reset)
    useEffect(() => {
        setLocalTitle(initialTitle);
    }, [initialTitle]);

    const handleBlur = () => {
        if (localTitle !== initialTitle) {
            onUpdate(localTitle);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.currentTarget.blur();
        }
    };

    return (
        <div className="title-input-container mb-16">
            <input
                type="text"
                className="form-input w-full text-lg"
                placeholder="Add a title for this round..."
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                disabled={!isAdmin}
            />
        </div>
    );
};

export default RoundTitle;
